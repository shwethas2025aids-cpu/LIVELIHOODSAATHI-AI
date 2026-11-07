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
    const orgId = params.id;

    // Strict multi-tenant isolation check
    if (!enforceOrgScope(user, orgId)) {
      return NextResponse.json(
        { error: 'Forbidden: Access to another organization profile is prohibited.' },
        { status: 403 }
      );
    }

    const org = db.prepare(`
      SELECT o.*,
        (SELECT COUNT(*) FROM beneficiary_profiles WHERE organization_id = o.id) as beneficiary_count,
        (SELECT COUNT(*) FROM organization_members WHERE organization_id = o.id) as member_count,
        (SELECT COUNT(*) FROM training_programmes WHERE organization_id = o.id) as programme_count,
        (SELECT COUNT(*) FROM training_enrollments WHERE organization_id = o.id) as total_enrollments,
        (SELECT COUNT(*) FROM training_enrollments WHERE organization_id = o.id AND status = 'COMPLETED') as completed_enrollments
      FROM organizations o
      WHERE o.id = ?
    `).get(orgId) as (Record<string, unknown> & { settings_json?: string }) | undefined;

    if (!org) {
      return NextResponse.json({ error: 'Organization not found.' }, { status: 404 });
    }

    // List members
    const members = db.prepare(`
      SELECT om.*, u.name, u.email, u.phone, u.avatar
      FROM organization_members om
      JOIN users u ON om.user_id = u.id
      WHERE om.organization_id = ?
      ORDER BY om.role DESC, u.name ASC
    `).all(orgId);

    return NextResponse.json({
      organization: {
        ...org,
        settings: JSON.parse(org.settings_json || '{}'),
        members,
      },
    });
  } catch (error) {
    console.error('Get Organization Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve organization details.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(req, ['SUPER_ADMIN', 'ORG_ADMIN']);
    if ('errorResponse' in auth) {
      return auth.errorResponse;
    }

    const { user } = auth;
    const orgId = params.id;

    // Strict multi-tenant isolation check
    if (!enforceOrgScope(user, orgId)) {
      return NextResponse.json(
        { error: 'Forbidden: You cannot modify another organization.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, phone, address, district, state, settings } = body;

    const existing = db.prepare('SELECT id, settings_json FROM organizations WHERE id = ?').get(orgId) as { id: string; settings_json: string } | undefined;
    if (!existing) {
      return NextResponse.json({ error: 'Organization not found.' }, { status: 404 });
    }

    const updatedSettings = settings ? JSON.stringify(settings) : existing.settings_json;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE organizations
      SET name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          district = COALESCE(?, district),
          state = COALESCE(?, state),
          settings_json = ?,
          updated_at = ?
      WHERE id = ?
    `).run(name || null, phone || null, address || null, district || null, state || null, updatedSettings, now, orgId);

    logAuditEvent({
      userId: user.userId,
      organizationId: orgId,
      action: 'ORGANIZATION_UPDATED',
      resourceType: 'organizations',
      resourceId: orgId,
      details: { name, district },
    });

    return NextResponse.json({
      success: true,
      message: 'Organization updated successfully',
    });
  } catch (error) {
    console.error('Update Organization Error:', error);
    return NextResponse.json({ error: 'Failed to update organization.' }, { status: 500 });
  }
}
