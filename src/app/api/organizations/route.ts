export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db, logAuditEvent } from '@/lib/db';
import { requireAuth, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if ('errorResponse' in auth) {
      return auth.errorResponse;
    }

    const { user } = auth;

    let query = `
      SELECT o.*,
        (SELECT COUNT(*) FROM beneficiary_profiles WHERE organization_id = o.id) as beneficiary_count,
        (SELECT COUNT(*) FROM organization_members WHERE organization_id = o.id) as member_count,
        (SELECT COUNT(*) FROM training_programmes WHERE organization_id = o.id) as programme_count
      FROM organizations o
    `;
    const params: string[] = [];

    // Data isolation: non-superadmins only see their own organization
    if (user.role !== 'SUPER_ADMIN') {
      if (!user.organizationId) {
        return NextResponse.json({ organizations: [] });
      }
      query += ' WHERE o.id = ?';
      params.push(user.organizationId);
    }

    query += ' ORDER BY o.name ASC';

    const orgs = db.prepare(query).all(...params);

    return NextResponse.json({
      organizations: orgs.map((o: any) => ({
        ...o,
        settings: JSON.parse(o.settings_json || '{}'),
      })),
    });
  } catch (error) {
    console.error('List Organizations Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve organizations.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      slug,
      registrationNumber,
      type = 'NGO',
      contactEmail,
      phone,
      address,
      district,
      state = 'Tamil Nadu',
      adminName,
      adminEmail,
      adminPassword,
    } = body;

    if (!name || !contactEmail) {
      return NextResponse.json(
        { error: 'Organization name and contact email are required.' },
        { status: 400 }
      );
    }

    const orgSlug = slug
      ? slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
      : name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');

    const existingSlug = db.prepare('SELECT id FROM organizations WHERE slug = ?').get(orgSlug);
    if (existingSlug) {
      return NextResponse.json(
        { error: 'An organization with this slug/name already exists.' },
        { status: 409 }
      );
    }

    const orgId = `org-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO organizations (
        id, name, slug, registration_number, type, contact_email, phone, address, district, state, verification_status, settings_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VERIFIED', '{}', ?, ?)
    `).run(
      orgId,
      name.trim(),
      orgSlug,
      registrationNumber || null,
      type,
      contactEmail.trim().toLowerCase(),
      phone || null,
      address || null,
      district || null,
      state,
      now,
      now
    );

    // If initial administrator credentials are provided, create the ORG_ADMIN user
    let adminUserId = null;
    if (adminEmail && adminPassword && adminName) {
      const emailTrimmed = adminEmail.trim().toLowerCase();
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(emailTrimmed);

      if (!existingUser) {
        adminUserId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const passwordHash = hashPassword(adminPassword);

        db.prepare(`
          INSERT INTO users (
            id, organization_id, email, password_hash, name, phone, role, preferred_language, is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'ORG_ADMIN', 'ta-IN', 1, ?, ?)
        `).run(adminUserId, orgId, emailTrimmed, passwordHash, adminName.trim(), phone || null, now, now);

        db.prepare(`
          INSERT INTO organization_members (id, organization_id, user_id, role, title, created_at)
          VALUES (?, ?, ?, 'ORG_ADMIN', 'Organization Administrator', ?)
        `).run(`mem-${Date.now()}`, orgId, adminUserId, now);
      }
    }

    logAuditEvent({
      userId: adminUserId,
      organizationId: orgId,
      action: 'ORGANIZATION_CREATED',
      resourceType: 'organizations',
      resourceId: orgId,
      details: { name, slug: orgSlug, type },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Organization registered successfully',
        organization: {
          id: orgId,
          name: name.trim(),
          slug: orgSlug,
          type,
          contactEmail,
          district,
          state,
          adminUserId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create Organization Error:', error);
    return NextResponse.json({ error: 'Failed to create organization.' }, { status: 500 });
  }
}
