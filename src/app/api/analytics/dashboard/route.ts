export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, resolveScopedOrgId } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req, ['SUPER_ADMIN', 'ORG_ADMIN', 'COORDINATOR']);
    if ('errorResponse' in auth) {
      return auth.errorResponse;
    }

    const { user } = auth;
    const url = new URL(req.url);

    // Apply strict multi-tenant scoping
    const scopedOrgId = resolveScopedOrgId(user, url.searchParams.get('organizationId'));

    const orgWhereClause = scopedOrgId ? 'WHERE organization_id = ?' : '';
    const orgParams: string[] = scopedOrgId ? [scopedOrgId] : [];

    // 1. Total & Active Beneficiaries
    const benStats = db.prepare(`
      SELECT
        COUNT(*) as total_beneficiaries,
        SUM(CASE WHEN u.is_active = 1 THEN 1 ELSE 0 END) as active_beneficiaries,
        SUM(CASE WHEN bp.completed_assessment = 1 THEN 1 ELSE 0 END) as completed_assessments,
        SUM(CASE WHEN bp.completed_assessment = 0 THEN 1 ELSE 0 END) as pending_assessments
      FROM beneficiary_profiles bp
      JOIN users u ON bp.user_id = u.id
      ${orgWhereClause.replace(/organization_id/g, 'bp.organization_id')}
    `).get(...orgParams) as Record<string, number>;

    // 2. Training Programme Statistics
    const progStats = db.prepare(`
      SELECT
        COUNT(*) as total_programmes,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_programmes,
        SUM(total_seats) as total_seats,
        SUM(available_seats) as available_seats
      FROM training_programmes
      ${orgWhereClause}
    `).get(...orgParams) as Record<string, number>;

    // 3. Training Enrollment & Completion Statistics
    const enrollStats = db.prepare(`
      SELECT
        COUNT(*) as total_enrollments,
        SUM(CASE WHEN status = 'ENROLLED' THEN 1 ELSE 0 END) as enrolled,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'DROPPED' THEN 1 ELSE 0 END) as dropped,
        AVG(attendance_pct) as avg_attendance
      FROM training_enrollments
      ${orgWhereClause}
    `).get(...orgParams) as Record<string, number>;

    const totalEnrollments = enrollStats.total_enrollments || 0;
    const completedEnrollments = enrollStats.completed || 0;
    const completionRate = totalEnrollments > 0
      ? Number(((completedEnrollments / totalEnrollments) * 100).toFixed(1))
      : 0;

    // 4. Skill-Category Distribution from actual Skills & Assessments
    const skillDistribution = db.prepare(`
      SELECT
        s.category,
        COUNT(bs.id) as beneficiary_skill_count,
        SUM(CASE WHEN bs.verified = 1 THEN 1 ELSE 0 END) as verified_count
      FROM beneficiary_skills bs
      JOIN skills s ON bs.skill_id = s.id
      JOIN beneficiary_profiles bp ON bs.beneficiary_id = bp.id
      ${scopedOrgId ? 'WHERE bp.organization_id = ?' : ''}
      GROUP BY s.category
      ORDER BY beneficiary_skill_count DESC
    `).all(...orgParams);

    // 5. Assessment Dominant Domain Breakdown
    const assessmentDomains = db.prepare(`
      SELECT
        dominant_domain,
        COUNT(*) as count
      FROM career_assessments
      ${orgWhereClause}
      GROUP BY dominant_domain
      ORDER BY count DESC
    `).all(...orgParams);

    // 6. Recent Beneficiary Progress Milestones (Structured Timeline)
    const recentMilestones = db.prepare(`
      SELECT pr.*, bp.beneficiary_code, u.name as beneficiary_name, u_rec.name as recorded_by_name
      FROM progress_records pr
      JOIN beneficiary_profiles bp ON pr.beneficiary_id = bp.id
      JOIN users u ON bp.user_id = u.id
      LEFT JOIN users u_rec ON pr.recorded_by_user_id = u_rec.id
      ${scopedOrgId ? 'WHERE pr.organization_id = ?' : ''}
      ORDER BY pr.created_at DESC
      LIMIT 8
    `).all(...orgParams);

    // 7. Organization info if scoped
    let organization = null;
    if (scopedOrgId) {
      organization = db.prepare('SELECT id, name, slug, type, district, state FROM organizations WHERE id = ?').get(scopedOrgId);
    }

    return NextResponse.json({
      organization,
      metrics: {
        beneficiaries: {
          total: benStats.total_beneficiaries || 0,
          active: benStats.active_beneficiaries || 0,
          completedAssessments: benStats.completed_assessments || 0,
          pendingAssessments: benStats.pending_assessments || 0,
          assessmentCompletionRate: benStats.total_beneficiaries > 0
            ? Number(((benStats.completed_assessments / benStats.total_beneficiaries) * 100).toFixed(1))
            : 0,
        },
        training: {
          totalProgrammes: progStats.total_programmes || 0,
          activeProgrammes: progStats.active_programmes || 0,
          totalSeats: progStats.total_seats || 0,
          availableSeats: progStats.available_seats || 0,
          occupiedSeats: (progStats.total_seats || 0) - (progStats.available_seats || 0),
          totalEnrollments,
          inProgress: enrollStats.in_progress || 0,
          completed: completedEnrollments,
          dropped: enrollStats.dropped || 0,
          completionRatePercent: completionRate,
          avgAttendancePercent: Number((enrollStats.avg_attendance || 0).toFixed(1)),
        },
        skillCategoryDistribution: skillDistribution,
        careerDomainDistribution: assessmentDomains,
        recentMilestones,
      },
    });
  } catch (error) {
    console.error('Analytics Dashboard Error:', error);
    return NextResponse.json({ error: 'Failed to calculate enterprise analytics.' }, { status: 500 });
  }
}
