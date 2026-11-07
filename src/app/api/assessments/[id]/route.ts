export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, enforceOrgScope } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(req);
    if ('errorResponse' in auth) {
      return auth.errorResponse;
    }

    const { user } = auth;
    const assessmentId = params.id;

    const assessment = db.prepare(`
      SELECT ca.*,
             bp.beneficiary_code, bp.education_level, bp.target_career,
             u.name as beneficiary_name, u.email as beneficiary_email,
             o.name as organization_name,
             u_eval.name as assessed_by_name
      FROM career_assessments ca
      JOIN beneficiary_profiles bp ON ca.beneficiary_id = bp.id
      JOIN users u ON bp.user_id = u.id
      LEFT JOIN organizations o ON ca.organization_id = o.id
      LEFT JOIN users u_eval ON ca.assessed_by_user_id = u_eval.id
      WHERE ca.id = ?
    `).get(assessmentId) as (Record<string, unknown> & { user_id?: string; beneficiary_id: string; organization_id: string | null }) | undefined;

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 });
    }

    if (user.role === 'BENEFICIARY') {
      const myProfile = db.prepare('SELECT id FROM beneficiary_profiles WHERE user_id = ?').get(user.userId) as { id: string } | undefined;
      if (!myProfile || myProfile.id !== assessment.beneficiary_id) {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
      }
    } else if (!enforceOrgScope(user, assessment.organization_id)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    // Fetch individual skill gaps linked to this assessment
    const skillGaps = db.prepare(`
      SELECT * FROM skill_gaps WHERE assessment_id = ? ORDER BY priority ASC
    `).all(assessmentId);

    return NextResponse.json({
      assessment: {
        ...assessment,
        domain_scores: JSON.parse((assessment as { domain_scores_json?: string }).domain_scores_json || '{}'),
        matched_careers: JSON.parse((assessment as { matched_careers_json?: string }).matched_careers_json || '[]'),
        top_skill_gaps: skillGaps.length > 0 ? skillGaps : JSON.parse((assessment as { top_skill_gaps_json?: string }).top_skill_gaps_json || '[]'),
        recommended_courses: JSON.parse((assessment as { recommended_courses_json?: string }).recommended_courses_json || '[]'),
        next_steps: JSON.parse((assessment as { next_steps_json?: string }).next_steps_json || '[]'),
        responses: JSON.parse((assessment as { responses_json?: string }).responses_json || '{}'),
      },
    });
  } catch (error) {
    console.error('Get Assessment Details Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve assessment details.' }, { status: 500 });
  }
}
