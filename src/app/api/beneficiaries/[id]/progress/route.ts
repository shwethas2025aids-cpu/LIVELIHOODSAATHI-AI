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

    const beneficiary = db.prepare(`
      SELECT bp.id, bp.user_id, bp.organization_id
      FROM beneficiary_profiles bp
      WHERE bp.id = ? OR bp.user_id = ?
    `).get(beneficiaryId, beneficiaryId) as { id: string; user_id: string; organization_id: string | null } | undefined;

    if (!beneficiary) {
      return NextResponse.json({ error: 'Beneficiary not found.' }, { status: 404 });
    }

    if (user.role === 'BENEFICIARY') {
      if (beneficiary.user_id !== user.userId) {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
      }
    } else if (!enforceOrgScope(user, beneficiary.organization_id)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const records = db.prepare(`
      SELECT pr.*, u.name as recorded_by_name, u.role as recorded_by_role
      FROM progress_records pr
      LEFT JOIN users u ON pr.recorded_by_user_id = u.id
      WHERE pr.beneficiary_id = ?
      ORDER BY pr.created_at DESC
    `).all(beneficiary.id);

    return NextResponse.json({ progressRecords: records });
  } catch (error) {
    console.error('List Progress Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve progress records.' }, { status: 500 });
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
    const { milestoneTitle, milestoneType, notes } = body;

    if (!milestoneTitle || !milestoneType) {
      return NextResponse.json(
        { error: 'milestoneTitle and milestoneType are required.' },
        { status: 400 }
      );
    }

    const id = `prog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO progress_records (id, beneficiary_id, organization_id, recorded_by_user_id, milestone_title, milestone_type, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, beneficiary.id, beneficiary.organization_id, user.userId, milestoneTitle, milestoneType, notes || null, now);

    logAuditEvent({
      userId: user.userId,
      organizationId: beneficiary.organization_id,
      action: 'PROGRESS_RECORDED',
      resourceType: 'progress_records',
      resourceId: id,
      details: { milestoneTitle, milestoneType },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Progress milestone recorded successfully',
        record: { id, milestoneTitle, milestoneType, notes, createdAt: now },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Record Progress Error:', error);
    return NextResponse.json({ error: 'Failed to record progress.' }, { status: 500 });
  }
}
