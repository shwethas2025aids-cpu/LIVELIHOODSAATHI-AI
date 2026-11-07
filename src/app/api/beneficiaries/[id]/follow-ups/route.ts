export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db, logAuditEvent } from '@/lib/db';
import { requireAuth, enforceOrgScope } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(req, ['SUPER_ADMIN', 'ORG_ADMIN', 'COORDINATOR']);
    if ('errorResponse' in auth) {
      return auth.errorResponse;
    }

    const { user } = auth;
    const beneficiaryId = params.id;

    const beneficiary = db.prepare(`
      SELECT bp.id, bp.organization_id
      FROM beneficiary_profiles bp
      WHERE bp.id = ? OR bp.user_id = ?
    `).get(beneficiaryId, beneficiaryId) as { id: string; organization_id: string | null } | undefined;

    if (!beneficiary) {
      return NextResponse.json({ error: 'Beneficiary not found.' }, { status: 404 });
    }

    if (!enforceOrgScope(user, beneficiary.organization_id)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const followUps = db.prepare(`
      SELECT fu.*, u.name as coordinator_name, u.email as coordinator_email
      FROM follow_up_records fu
      JOIN users u ON fu.coordinator_id = u.id
      WHERE fu.beneficiary_id = ?
      ORDER BY fu.contact_date DESC
    `).all(beneficiary.id);

    return NextResponse.json({ followUps });
  } catch (error) {
    console.error('List Follow-ups Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve follow-up records.' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(req, ['SUPER_ADMIN', 'ORG_ADMIN', 'COORDINATOR']);
    if ('errorResponse' in auth) {
      return auth.errorResponse;
    }

    const { user } = auth;
    const beneficiaryId = params.id;

    const beneficiary = db.prepare(`
      SELECT bp.id, bp.organization_id
      FROM beneficiary_profiles bp
      WHERE bp.id = ? OR bp.user_id = ?
    `).get(beneficiaryId, beneficiaryId) as { id: string; organization_id: string | null } | undefined;

    if (!beneficiary) {
      return NextResponse.json({ error: 'Beneficiary not found.' }, { status: 404 });
    }

    if (!enforceOrgScope(user, beneficiary.organization_id)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const body = await req.json();
    const { contactDate = new Date().toISOString().split('T')[0], channel = 'PHONE', notes, nextActionDate, status = 'COMPLETED' } = body;

    if (!notes) {
      return NextResponse.json({ error: 'Follow-up notes are required.' }, { status: 400 });
    }

    const id = `fu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO follow_up_records (
        id, beneficiary_id, organization_id, coordinator_id, contact_date, channel, notes, next_action_date, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      beneficiary.id,
      beneficiary.organization_id,
      user.userId,
      contactDate,
      channel,
      notes,
      nextActionDate || null,
      status,
      now
    );

    // Also record a progress timeline milestone
    db.prepare(`
      INSERT INTO progress_records (id, beneficiary_id, organization_id, recorded_by_user_id, milestone_title, milestone_type, notes, created_at)
      VALUES (?, ?, ?, ?, ?, 'FOLLOW_UP', ?, ?)
    `).run(
      `prog-${Date.now()}`,
      beneficiary.id,
      beneficiary.organization_id,
      user.userId,
      `Coordinator Follow-Up via ${channel}`,
      notes,
      now
    );

    logAuditEvent({
      userId: user.userId,
      organizationId: beneficiary.organization_id,
      action: 'FOLLOW_UP_LOGGED',
      resourceType: 'follow_up_records',
      resourceId: id,
      details: { channel, contactDate, status },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Follow-up interaction recorded successfully',
        followUp: { id, contactDate, channel, notes, nextActionDate, status, createdAt: now },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Record Follow-Up Error:', error);
    return NextResponse.json({ error: 'Failed to record follow-up.' }, { status: 500 });
  }
}
