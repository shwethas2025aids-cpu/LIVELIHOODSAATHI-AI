export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db, logAuditEvent } from '@/lib/db';
import { requireAuth, enforceOrgScope, hashPassword } from '@/lib/auth';

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
    const orgId = params.id;

    if (!enforceOrgScope(user, orgId)) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot access members of another organization.' },
        { status: 403 }
      );
    }

    const members = db.prepare(`
      SELECT om.id as membership_id, om.role, om.title, om.department, om.created_at as joined_at,
             u.id as user_id, u.name, u.email, u.phone, u.avatar, u.is_active,
             (SELECT COUNT(*) FROM beneficiary_profiles WHERE assigned_coordinator_id = u.id) as assigned_beneficiaries_count
      FROM organization_members om
      JOIN users u ON om.user_id = u.id
      WHERE om.organization_id = ?
      ORDER BY om.role DESC, u.name ASC
    `).all(orgId);

    return NextResponse.json({ members });
  } catch (error) {
    console.error('List Members Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve organization members.' }, { status: 500 });
  }
}

export async function POST(
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

    if (!enforceOrgScope(user, orgId)) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot add members to another organization.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, password, role = 'COORDINATOR', title, department, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    const emailTrimmed = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(emailTrimmed);
    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email address already exists.' },
        { status: 409 }
      );
    }

    const validRole = role === 'ORG_ADMIN' ? 'ORG_ADMIN' : 'COORDINATOR';
    const newUserId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const passwordHash = hashPassword(password);

    db.prepare(`
      INSERT INTO users (
        id, organization_id, email, password_hash, name, phone, role, preferred_language, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ta-IN', 1, ?, ?)
    `).run(newUserId, orgId, emailTrimmed, passwordHash, name.trim(), phone || null, validRole, now, now);

    const membershipId = `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    db.prepare(`
      INSERT INTO organization_members (
        id, organization_id, user_id, role, title, department, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      membershipId,
      orgId,
      newUserId,
      validRole,
      title || (validRole === 'ORG_ADMIN' ? 'Administrator' : 'Program Coordinator'),
      department || 'Field Operations',
      now
    );

    logAuditEvent({
      userId: user.userId,
      organizationId: orgId,
      action: 'MEMBER_ADDED',
      resourceType: 'organization_members',
      resourceId: membershipId,
      details: { addedUserEmail: emailTrimmed, role: validRole },
    });

    return NextResponse.json(
      {
        success: true,
        message: `${validRole === 'ORG_ADMIN' ? 'Administrator' : 'Coordinator'} added successfully`,
        member: {
          id: membershipId,
          userId: newUserId,
          name: name.trim(),
          email: emailTrimmed,
          role: validRole,
          title,
          department,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add Member Error:', error);
    return NextResponse.json({ error: 'Failed to add organization member.' }, { status: 500 });
  }
}
