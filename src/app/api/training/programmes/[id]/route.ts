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
    const programmeId = params.id;

    const prog = db.prepare(`
      SELECT tp.*, o.name as organization_name
      FROM training_programmes tp
      JOIN organizations o ON tp.organization_id = o.id
      WHERE tp.id = ?
    `).get(programmeId) as (Record<string, unknown> & { organization_id: string; skills_taught_json?: string }) | undefined;

    if (!prog) {
      return NextResponse.json({ error: 'Training programme not found.' }, { status: 404 });
    }

    if (!enforceOrgScope(user, prog.organization_id)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    // List enrolled beneficiaries
    const enrollments = db.prepare(`
      SELECT te.*, bp.beneficiary_code, u.name as beneficiary_name, u.email as beneficiary_email, u.phone as beneficiary_phone
      FROM training_enrollments te
      JOIN beneficiary_profiles bp ON te.beneficiary_id = bp.id
      JOIN users u ON bp.user_id = u.id
      WHERE te.programme_id = ?
      ORDER BY te.enrolled_at DESC
    `).all(programmeId);

    return NextResponse.json({
      programme: {
        ...prog,
        skills_taught: JSON.parse(prog.skills_taught_json || '[]'),
        enrollments,
      },
    });
  } catch (error) {
    console.error('Get Programme Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve training programme.' }, { status: 500 });
  }
}

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
    const programmeId = params.id;

    const prog = db.prepare('SELECT * FROM training_programmes WHERE id = ?').get(programmeId) as { id: string; organization_id: string } | undefined;
    if (!prog) {
      return NextResponse.json({ error: 'Programme not found.' }, { status: 404 });
    }

    if (!enforceOrgScope(user, prog.organization_id)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, titleTa, description, status, availableSeats, totalSeats, startDate, endDate } = body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE training_programmes
      SET title = COALESCE(?, title),
          title_ta = COALESCE(?, title_ta),
          description = COALESCE(?, description),
          status = COALESCE(?, status),
          available_seats = COALESCE(?, available_seats),
          total_seats = COALESCE(?, total_seats),
          start_date = COALESCE(?, start_date),
          end_date = COALESCE(?, end_date),
          updated_at = ?
      WHERE id = ?
    `).run(
      title || null,
      titleTa || null,
      description || null,
      status || null,
      availableSeats !== undefined ? availableSeats : null,
      totalSeats !== undefined ? totalSeats : null,
      startDate || null,
      endDate || null,
      now,
      programmeId
    );

    logAuditEvent({
      userId: user.userId,
      organizationId: prog.organization_id,
      action: 'TRAINING_PROGRAMME_UPDATED',
      resourceType: 'training_programmes',
      resourceId: programmeId,
      details: { status, availableSeats },
    });

    return NextResponse.json({
      success: true,
      message: 'Training programme updated successfully',
    });
  } catch (error) {
    console.error('Update Programme Error:', error);
    return NextResponse.json({ error: 'Failed to update programme.' }, { status: 500 });
  }
}
