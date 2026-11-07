export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db, logAuditEvent } from '@/lib/db';
import { requireAuth, enforceOrgScope, resolveScopedOrgId } from '@/lib/auth';
import { runScikitLearnRecommender } from '@/services/mlService';
import { gnaniService } from '@/services/gnaniService';
import { INITIAL_PATHWAYS } from '@/lib/constants';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if ('errorResponse' in auth) {
      return auth.errorResponse;
    }

    const { user } = auth;
    const url = new URL(req.url);
    const beneficiaryId = url.searchParams.get('beneficiary_id');

    let sql = `
      SELECT ca.*,
             bp.beneficiary_code, u.name as beneficiary_name, u.email as beneficiary_email,
             o.name as organization_name,
             u_eval.name as assessed_by_name
      FROM career_assessments ca
      JOIN beneficiary_profiles bp ON ca.beneficiary_id = bp.id
      JOIN users u ON bp.user_id = u.id
      LEFT JOIN organizations o ON ca.organization_id = o.id
      LEFT JOIN users u_eval ON ca.assessed_by_user_id = u_eval.id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (user.role === 'BENEFICIARY') {
      sql += ' AND u.id = ?';
      params.push(user.userId);
    } else {
      const scopedOrgId = resolveScopedOrgId(user, url.searchParams.get('organizationId'));
      if (scopedOrgId) {
        sql += ' AND ca.organization_id = ?';
        params.push(scopedOrgId);
      }
      if (beneficiaryId) {
        sql += ' AND ca.beneficiary_id = ?';
        params.push(beneficiaryId);
      }
    }

    sql += ' ORDER BY ca.created_at DESC';

    const assessments = db.prepare(sql).all(...params).map((a: any) => ({
      ...a,
      domain_scores: JSON.parse(a.domain_scores_json || '{}'),
      matched_careers: JSON.parse(a.matched_careers_json || '[]'),
      top_skill_gaps: JSON.parse(a.top_skill_gaps_json || '[]'),
      recommended_courses: JSON.parse(a.recommended_courses_json || '[]'),
      next_steps: JSON.parse(a.next_steps_json || '[]'),
    }));

    return NextResponse.json({ assessments });
  } catch (error) {
    console.error('List Assessments Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve assessments.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if ('errorResponse' in auth) {
      return auth.errorResponse;
    }

    const { user } = auth;
    const body = await req.json();

    let beneficiaryId = body.beneficiaryId;
    if (user.role === 'BENEFICIARY') {
      const myProfile = db.prepare('SELECT id FROM beneficiary_profiles WHERE user_id = ?').get(user.userId) as { id: string } | undefined;
      if (!myProfile) {
        return NextResponse.json({ error: 'Beneficiary profile not found.' }, { status: 404 });
      }
      beneficiaryId = myProfile.id;
    }

    if (!beneficiaryId) {
      return NextResponse.json({ error: 'beneficiaryId is required.' }, { status: 400 });
    }

    // Fetch beneficiary
    const beneficiary = db.prepare(`
      SELECT bp.*, u.name, u.email, u.preferred_language
      FROM beneficiary_profiles bp
      JOIN users u ON bp.user_id = u.id
      WHERE bp.id = ?
    `).get(beneficiaryId) as (Record<string, unknown> & { id: string; organization_id: string | null; name: string; education_level: string; target_career: string; preferred_language: string }) | undefined;

    if (!beneficiary) {
      return NextResponse.json({ error: 'Beneficiary not found.' }, { status: 404 });
    }

    if (user.role !== 'BENEFICIARY' && !enforceOrgScope(user, beneficiary.organization_id)) {
      return NextResponse.json({ error: 'Forbidden: Access to another organization beneficiary is denied.' }, { status: 403 });
    }

    const education = body.education || beneficiary.education_level || 'Higher Secondary (+2)';
    const targetCareer = body.targetCareer || beneficiary.target_career || 'Software & Tech Roles';
    const skills: string[] = body.skills || [];
    const interests: string[] = body.interests || [];
    const language = body.language || beneficiary.preferred_language || 'ta-IN';

    // Fetch active training programmes from DB
    const dbProgrammes = db.prepare(`
      SELECT id, title, sector, skills_taught_json, description, available_seats, duration_weeks
      FROM training_programmes
      WHERE (organization_id = ? OR organization_id IS NULL) AND status = 'ACTIVE'
    `).all(beneficiary.organization_id || '') as Array<{
      id: string;
      title: string;
      sector: string;
      skills_taught_json: string;
      description: string;
      available_seats: number;
      duration_weeks: number;
    }>;

    const formattedProgrammes = dbProgrammes.map((p) => ({
      id: p.id,
      title: p.title,
      sector: p.sector,
      skills_taught: JSON.parse(p.skills_taught_json || '[]'),
      description: p.description,
      available_seats: p.available_seats,
      duration_weeks: p.duration_weeks,
    }));

    // Format career pathways corpus
    const formattedPathways = INITIAL_PATHWAYS.map((p) => ({
      id: p.id,
      title: p.title,
      sector: p.sector,
      required_skills: p.stages.flatMap((s) => s.keyActions),
      description: p.description,
    }));

    // 1. Run Scikit-Learn Recommender (TF-IDF & Cosine Similarity)
    const mlResult = await runScikitLearnRecommender({
      education,
      skills,
      interests,
      target_career: targetCareer,
      preferred_language: language,
      career_pathways: formattedPathways,
      programmes: formattedProgrammes,
    });

    // 2. Run Gnani Evon 30B Reasoning Model
    const evonResult = await gnaniService.generateEvonGuidance({
      education,
      skills,
      interests,
      targetCareer,
      preferredLanguage: language,
      beneficiaryName: beneficiary.name,
      skillGaps: mlResult.skill_gaps,
      matchedCareers: mlResult.matched_careers,
      rankedProgrammes: mlResult.ranked_programmes,
    });

    const assessmentId = `ass-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    // 3. Persist Career Assessment to DB
    db.prepare(`
      INSERT INTO career_assessments (
        id, beneficiary_id, organization_id, assessed_by_user_id, responses_json, dominant_domain, domain_scores_json, summary, summary_ta, matched_careers_json, top_skill_gaps_json, recommended_courses_json, next_steps_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      assessmentId,
      beneficiary.id,
      beneficiary.organization_id,
      user.userId,
      JSON.stringify(body.responses || {}),
      mlResult.dominant_domain,
      JSON.stringify(mlResult.domain_scores),
      evonResult.summary,
      evonResult.summaryTa,
      JSON.stringify(mlResult.matched_careers),
      JSON.stringify(mlResult.skill_gaps),
      JSON.stringify(mlResult.ranked_programmes),
      JSON.stringify(evonResult.actionableSteps),
      now
    );

    // 4. Record Identified Skill Gaps to DB
    const insertGap = db.prepare(`
      INSERT INTO skill_gaps (id, assessment_id, beneficiary_id, target_career, skill_name, priority, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'IDENTIFIED', ?)
    `);

    for (const gap of mlResult.skill_gaps) {
      insertGap.run(
        `gap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        assessmentId,
        beneficiary.id,
        targetCareer,
        gap.skill,
        gap.priority,
        now
      );
    }

    // 5. Update beneficiary profile completed_assessment flag
    db.prepare(`
      UPDATE beneficiary_profiles
      SET completed_assessment = 1,
          updated_at = ?
      WHERE id = ?
    `).run(now, beneficiary.id);

    // 6. Record progress timeline milestone
    db.prepare(`
      INSERT INTO progress_records (id, beneficiary_id, organization_id, recorded_by_user_id, milestone_title, milestone_type, notes, created_at)
      VALUES (?, ?, ?, ?, ?, 'ASSESSMENT', ?, ?)
    `).run(
      `prog-${Date.now()}`,
      beneficiary.id,
      beneficiary.organization_id,
      user.userId,
      `AI Skills & Career Assessment Completed (${mlResult.dominant_domain})`,
      `${evonResult.summary}. Primary Career Match: ${mlResult.matched_careers[0]?.title || targetCareer}`,
      now
    );

    logAuditEvent({
      userId: user.userId,
      organizationId: beneficiary.organization_id,
      action: 'ASSESSMENT_COMPLETED',
      resourceType: 'career_assessments',
      resourceId: assessmentId,
      details: {
        dominantDomain: mlResult.dominant_domain,
        matchedCareer: mlResult.matched_careers[0]?.title,
        skillGapsCount: mlResult.skill_gaps.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Assessment completed and recommendations generated',
      assessmentId,
      assessment: {
        id: assessmentId,
        beneficiaryId: beneficiary.id,
        dominantDomain: mlResult.dominant_domain,
        domainScores: mlResult.domain_scores,
        matchedCareers: mlResult.matched_careers,
        skillGaps: mlResult.skill_gaps,
        recommendedProgrammes: mlResult.ranked_programmes,
        summary: evonResult.summary,
        summaryTa: evonResult.summaryTa,
        evonGuidance: evonResult.message,
        careerReasoning: evonResult.careerReasoning,
        actionableSteps: evonResult.actionableSteps,
        recommendationEngine: mlResult.engine,
        aiProvider: evonResult.provider,
        providerStatus: evonResult.status,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Submit Assessment Error:', error);
    return NextResponse.json({ error: 'Failed to process career assessment.' }, { status: 500 });
  }
}
