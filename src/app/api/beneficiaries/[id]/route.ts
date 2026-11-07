export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db, logAuditEvent } from '@/lib/db';
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
    const beneficiaryId = params.id;

    // Fetch beneficiary profile
    const beneficiary = db.prepare(`
      SELECT bp.*,
             u.name, u.email, u.phone, u.avatar, u.is_active, u.created_at as user_created_at,
             o.name as organization_name, o.slug as organization_slug,
             u_coord.name as coordinator_name, u_coord.email as coordinator_email, u_coord.phone as coordinator_phone
      FROM beneficiary_profiles bp
      JOIN users u ON bp.user_id = u.id
      LEFT JOIN organizations o ON bp.organization_id = o.id
      LEFT JOIN users u_coord ON bp.assigned_coordinator_id = u_coord.id
      WHERE bp.id = ? OR bp.user_id = ?
    `).get(beneficiaryId, beneficiaryId) as (Record<string, unknown> & { id: string; user_id: string; organization_id: string | null }) | undefined;

    if (!beneficiary) {
      return NextResponse.json({ error: 'Beneficiary profile not found.' }, { status: 404 });
    }

    // Role & Tenant isolation check
    if (user.role === 'BENEFICIARY') {
      if (beneficiary.user_id !== user.userId) {
        return NextResponse.json(
          { error: 'Forbidden: Beneficiaries can only access their own profile.' },
          { status: 403 }
        );
      }
    } else if (!enforceOrgScope(user, beneficiary.organization_id)) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot access beneficiary belonging to another organization.' },
        { status: 403 }
      );
    }

    // Fetch acquired skills
    const skills = db.prepare(`
      SELECT bs.*, s.name, s.name_ta, s.category, s.demand_level, s.avg_salary_boost
      FROM beneficiary_skills bs
      JOIN skills s ON bs.skill_id = s.id
      WHERE bs.beneficiary_id = ?
      ORDER BY bs.verified DESC, s.name ASC
    `).all(beneficiary.id);

    // Fetch career assessments history
    const assessments = db.prepare(`
      SELECT ca.*, u_eval.name as assessed_by_name
      FROM career_assessments ca
      LEFT JOIN users u_eval ON ca.assessed_by_user_id = u_eval.id
      WHERE ca.beneficiary_id = ?
      ORDER BY ca.created_at DESC
    `).all(beneficiary.id).map((a: any) => ({
      ...a,
      domain_scores: JSON.parse(a.domain_scores_json || '{}'),
      matched_careers: JSON.parse(a.matched_careers_json || '[]'),
      top_skill_gaps: JSON.parse(a.top_skill_gaps_json || '[]'),
      recommended_courses: JSON.parse(a.recommended_courses_json || '[]'),
      next_steps: JSON.parse(a.next_steps_json || '[]'),
    }));

    // Fetch identified skill gaps
    const skillGaps = db.prepare(`
      SELECT sg.*, s.category, s.learning_duration_weeks
      FROM skill_gaps sg
      LEFT JOIN skills s ON sg.skill_id = s.id
      WHERE sg.beneficiary_id = ?
      ORDER BY sg.status ASC, sg.priority ASC
    `).all(beneficiary.id);

    // Fetch training enrollments
    const enrollments = db.prepare(`
      SELECT te.*, tp.title as programme_title, tp.title_ta as programme_title_ta, tp.sector, tp.duration_weeks, tp.start_date, tp.end_date
      FROM training_enrollments te
      JOIN training_programmes tp ON te.programme_id = tp.id
      WHERE te.beneficiary_id = ?
      ORDER BY te.enrolled_at DESC
    `).all(beneficiary.id);

    // Fetch structured progress history
    const progressTimeline = db.prepare(`
      SELECT pr.*, u.name as recorded_by_name
      FROM progress_records pr
      LEFT JOIN users u ON pr.recorded_by_user_id = u.id
      WHERE pr.beneficiary_id = ?
      ORDER BY pr.created_at DESC
    `).all(beneficiary.id);

    // Fetch coordinator follow-up records
    const followUps = db.prepare(`
      SELECT fu.*, u.name as coordinator_name
      FROM follow_up_records fu
      JOIN users u ON fu.coordinator_id = u.id
      WHERE fu.beneficiary_id = ?
      ORDER BY fu.contact_date DESC
    `).all(beneficiary.id);

    return NextResponse.json({
      beneficiary: {
        ...beneficiary,
        skills,
        assessments,
        skillGaps,
        enrollments,
        progressTimeline,
        followUps,
      },
    });
  } catch (error) {
    console.error('Get Beneficiary Details Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve beneficiary details.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(req);
    if ('errorResponse' in auth) {
      return auth.errorResponse;
    }

    const { user } = auth;
    const beneficiaryId = params.id;

    const beneficiary = db.prepare(`
      SELECT bp.*, u.id as user_id
      FROM beneficiary_profiles bp
      JOIN users u ON bp.user_id = u.id
      WHERE bp.id = ? OR bp.user_id = ?
    `).get(beneficiaryId, beneficiaryId) as { id: string; user_id: string; organization_id: string | null } | undefined;

    if (!beneficiary) {
      return NextResponse.json({ error: 'Beneficiary not found.' }, { status: 404 });
    }

    // Tenant check
    if (user.role === 'BENEFICIARY') {
      if (beneficiary.user_id !== user.userId) {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
      }
    } else if (!enforceOrgScope(user, beneficiary.organization_id)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      phone,
      educationLevel,
      targetCareer,
      location,
      district,
      state,
      preferredLanguage,
      experienceYears,
      employmentStatus,
      annualIncomeBracket,
      notes,
      assignedCoordinatorId,
    } = body;

    const now = new Date().toISOString();

    // Update user table fields
    if (name || phone || preferredLanguage) {
      db.prepare(`
        UPDATE users
        SET name = COALESCE(?, name),
            phone = COALESCE(?, phone),
            preferred_language = COALESCE(?, preferred_language),
            updated_at = ?
        WHERE id = ?
      `).run(name || null, phone || null, preferredLanguage || null, now, beneficiary.user_id);
    }

    // Coordinators can only be assigned by ORG_ADMIN or SUPER_ADMIN
    const coordUpdate = ['ORG_ADMIN', 'SUPER_ADMIN'].includes(user.role)
      ? assignedCoordinatorId
      : undefined;

    db.prepare(`
      UPDATE beneficiary_profiles
      SET education_level = COALESCE(?, education_level),
          target_career = COALESCE(?, target_career),
          location = COALESCE(?, location),
          district = COALESCE(?, district),
          state = COALESCE(?, state),
          preferred_language = COALESCE(?, preferred_language),
          experience_years = COALESCE(?, experience_years),
          employment_status = COALESCE(?, employment_status),
          annual_income_bracket = COALESCE(?, annual_income_bracket),
          notes = COALESCE(?, notes),
          assigned_coordinator_id = CASE WHEN ? IS NOT NULL THEN ? ELSE assigned_coordinator_id END,
          updated_at = ?
      WHERE id = ?
    `).run(
      educationLevel ?? null,
      targetCareer ?? null,
      location ?? null,
      district ?? null,
      state ?? null,
      preferredLanguage ?? null,
      experienceYears ?? null,
      employmentStatus ?? null,
      annualIncomeBracket ?? null,
      notes ?? null,
      coordUpdate !== undefined ? coordUpdate : null,
      coordUpdate !== undefined ? coordUpdate : null,
      now,
      beneficiary.id
    );

    logAuditEvent({
      userId: user.userId,
      organizationId: beneficiary.organization_id,
      action: 'BENEFICIARY_UPDATED',
      resourceType: 'beneficiary_profiles',
      resourceId: beneficiary.id,
      details: { updatedBy: user.name, role: user.role },
    });

    return NextResponse.json({
      success: true,
      message: 'Beneficiary profile updated successfully',
    });
  } catch (error) {
    console.error('Update Beneficiary Error:', error);
    return NextResponse.json({ error: 'Failed to update beneficiary profile.' }, { status: 500 });
  }
}
