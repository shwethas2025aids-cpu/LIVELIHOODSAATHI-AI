export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db, logAuditEvent } from '@/lib/db';
import { requireAuth, enforceOrgScope } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(req, ['SUPER_ADMIN', 'ORG_ADMIN', 'COORDINATOR']);
    if ('errorResponse' in auth) {
      return auth.errorResponse;
    }

    const { user } = auth;
    const enrollmentId = params.id;

    const enrollment = db.prepare(`
      SELECT te.*, tp.title as programme_title
      FROM training_enrollments te
      JOIN training_programmes tp ON te.programme_id = tp.id
      WHERE te.id = ?
    `).get(enrollmentId) as {
      id: string;
      programme_id: string;
      beneficiary_id: string;
      organization_id: string;
      status: string;
      programme_title: string;
    } | undefined;

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment record not found.' }, { status: 404 });
    }

    if (!enforceOrgScope(user, enrollment.organization_id)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const body = await req.json();
    const { status, attendancePct, gradeOrRemarks } = body;

    const now = new Date().toISOString();
    const isNowCompleted = status === 'COMPLETED' && enrollment.status !== 'COMPLETED';
    const isNowDropped = status === 'DROPPED' && enrollment.status !== 'DROPPED';
    const completionDate = isNowCompleted ? now : null;

    db.prepare(`
      UPDATE training_enrollments
      SET status = COALESCE(?, status),
          attendance_pct = COALESCE(?, attendance_pct),
          grade_or_remarks = COALESCE(?, grade_or_remarks),
          completion_date = CASE WHEN ? = 'COMPLETED' THEN ? ELSE completion_date END,
          updated_at = ?
      WHERE id = ?
    `).run(
      status || null,
      attendancePct !== undefined ? attendancePct : null,
      gradeOrRemarks || null,
      status || null,
      completionDate,
      now,
      enrollmentId
    );

    // If dropped, restore seat to programme
    if (isNowDropped) {
      db.prepare(`
        UPDATE training_programmes
        SET available_seats = available_seats + 1,
            updated_at = ?
        WHERE id = ?
      `).run(now, enrollment.programme_id);
    }

    // If completed, record progress milestone
    if (isNowCompleted) {
      db.prepare(`
        INSERT INTO progress_records (id, beneficiary_id, organization_id, recorded_by_user_id, milestone_title, milestone_type, notes, created_at)
        VALUES (?, ?, ?, ?, ?, 'TRAINING_COMPLETE', ?, ?)
      `).run(
        `prog-${Date.now()}`,
        enrollment.beneficiary_id,
        enrollment.organization_id,
        user.userId,
        `Completed Training: ${enrollment.programme_title}`,
        `Successfully graduated with grade/remarks: ${gradeOrRemarks || 'Good Standing'}. Attendance: ${attendancePct ?? 'Verified'}%`,
        now
      );
    }

    logAuditEvent({
      userId: user.userId,
      organizationId: enrollment.organization_id,
      action: 'ENROLLMENT_STATUS_UPDATED',
      resourceType: 'training_enrollments',
      resourceId: enrollmentId,
      details: { newStatus: status, remarks: gradeOrRemarks },
    });

    return NextResponse.json({
      success: true,
      message: `Enrollment status updated to '${status || enrollment.status}'`,
    });
  } catch (error) {
    console.error('Update Enrollment Error:', error);
    return NextResponse.json({ error: 'Failed to update enrollment.' }, { status: 500 });
  }
}
