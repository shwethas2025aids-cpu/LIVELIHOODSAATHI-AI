export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db, logAuditEvent } from '@/lib/db';
import { requireAuth, enforceOrgScope, resolveScopedOrgId } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if ('errorResponse' in auth) {
      return auth.errorResponse;
    }

    const { user } = auth;
    const url = new URL(req.url);
    const programmeId = url.searchParams.get('programme_id');
    const beneficiaryId = url.searchParams.get('beneficiary_id');
    const status = url.searchParams.get('status');

    let sql = `
      SELECT te.*,
             tp.title as programme_title, tp.title_ta as programme_title_ta, tp.sector, tp.duration_weeks, tp.start_date, tp.end_date,
             bp.beneficiary_code, u.name as beneficiary_name, u.email as beneficiary_email, u.phone as beneficiary_phone,
             o.name as organization_name
      FROM training_enrollments te
      JOIN training_programmes tp ON te.programme_id = tp.id
      JOIN beneficiary_profiles bp ON te.beneficiary_id = bp.id
      JOIN users u ON bp.user_id = u.id
      JOIN organizations o ON te.organization_id = o.id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (user.role === 'BENEFICIARY') {
      sql += ' AND u.id = ?';
      params.push(user.userId);
    } else {
      const scopedOrgId = resolveScopedOrgId(user, url.searchParams.get('organizationId'));
      if (scopedOrgId) {
        sql += ' AND te.organization_id = ?';
        params.push(scopedOrgId);
      }
      if (programmeId) {
        sql += ' AND te.programme_id = ?';
        params.push(programmeId);
      }
      if (beneficiaryId) {
        sql += ' AND te.beneficiary_id = ?';
        params.push(beneficiaryId);
      }
    }

    if (status) {
      sql += ' AND te.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY te.enrolled_at DESC';

    const enrollments = db.prepare(sql).all(...params);

    return NextResponse.json({ enrollments });
  } catch (error) {
    console.error('List Enrollments Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve enrollments.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req, ['SUPER_ADMIN', 'ORG_ADMIN', 'COORDINATOR']);
    if ('errorResponse' in auth) {
      return auth.errorResponse;
    }

    const { user } = auth;
    const body = await req.json();
    const { programmeId, beneficiaryId, status = 'ENROLLED' } = body;

    if (!programmeId || !beneficiaryId) {
      return NextResponse.json(
        { error: 'programmeId and beneficiaryId are required.' },
        { status: 400 }
      );
    }

    // Fetch programme
    const prog = db.prepare('SELECT * FROM training_programmes WHERE id = ?').get(programmeId) as {
      id: string;
      organization_id: string;
      title: string;
      available_seats: number;
      status: string;
    } | undefined;

    if (!prog) {
      return NextResponse.json({ error: 'Training programme not found.' }, { status: 404 });
    }

    if (prog.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Cannot enroll: programme status is '${prog.status}'. Must be 'ACTIVE'.` },
        { status: 400 }
      );
    }

    if (prog.available_seats <= 0) {
      return NextResponse.json(
        { error: 'Cannot enroll: No available seats left in this programme.' },
        { status: 400 }
      );
    }

    // Fetch beneficiary
    const beneficiary = db.prepare(`
      SELECT bp.*, u.name, u.email
      FROM beneficiary_profiles bp
      JOIN users u ON bp.user_id = u.id
      WHERE bp.id = ?
    `).get(beneficiaryId) as { id: string; organization_id: string | null; name: string } | undefined;

    if (!beneficiary) {
      return NextResponse.json({ error: 'Beneficiary not found.' }, { status: 404 });
    }

    // Check organization isolation
    if (!enforceOrgScope(user, prog.organization_id)) {
      return NextResponse.json({ error: 'Forbidden: You cannot enroll into another organization programme.' }, { status: 403 });
    }

    // Check existing enrollment
    const existing = db.prepare('SELECT id, status FROM training_enrollments WHERE programme_id = ? AND beneficiary_id = ?').get(programmeId, beneficiary.id) as { id: string; status: string } | undefined;
    if (existing) {
      return NextResponse.json(
        { error: `Beneficiary is already enrolled in this programme with status '${existing.status}'.` },
        { status: 409 }
      );
    }

    const enrollmentId = `enr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    // Insert enrollment
    db.prepare(`
      INSERT INTO training_enrollments (
        id, programme_id, beneficiary_id, organization_id, status, enrolled_at, attendance_pct, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 100.0, ?)
    `).run(enrollmentId, programmeId, beneficiary.id, prog.organization_id, status, now, now);

    // Decrement available seats
    db.prepare(`
      UPDATE training_programmes
      SET available_seats = MAX(0, available_seats - 1),
          updated_at = ?
      WHERE id = ?
    `).run(now, programmeId);

    // Record progress timeline event
    db.prepare(`
      INSERT INTO progress_records (id, beneficiary_id, organization_id, recorded_by_user_id, milestone_title, milestone_type, notes, created_at)
      VALUES (?, ?, ?, ?, ?, 'TRAINING_START', ?, ?)
    `).run(
      `prog-${Date.now()}`,
      beneficiary.id,
      prog.organization_id,
      user.userId,
      `Enrolled in ${prog.title}`,
      `Enrolled with status: ${status} by coordinator ${user.name}.`,
      now
    );

    logAuditEvent({
      userId: user.userId,
      organizationId: prog.organization_id,
      action: 'BENEFICIARY_ENROLLED',
      resourceType: 'training_enrollments',
      resourceId: enrollmentId,
      details: { programmeId, beneficiaryId: beneficiary.id },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Beneficiary successfully enrolled',
        enrollment: {
          id: enrollmentId,
          programmeId,
          programmeTitle: prog.title,
          beneficiaryId: beneficiary.id,
          beneficiaryName: beneficiary.name,
          status,
          enrolledAt: now,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Enroll Beneficiary Error:', error);
    return NextResponse.json({ error: 'Failed to enroll beneficiary.' }, { status: 500 });
  }
}
