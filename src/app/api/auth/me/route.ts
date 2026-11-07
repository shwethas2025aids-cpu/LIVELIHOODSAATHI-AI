export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if ('errorResponse' in auth) {
      return auth.errorResponse;
    }

    const { user: tokenUser } = auth;

    const user = db.prepare(`
      SELECT u.id, u.organization_id, u.email, u.name, u.phone, u.role, u.avatar, u.preferred_language, u.is_active, u.created_at,
             o.name as org_name, o.slug as org_slug, o.type as org_type, o.verification_status as org_status
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.id = ?
    `).get(tokenUser.userId) as (Record<string, unknown> & { id: string; role: string }) | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    let beneficiaryProfile = null;
    if (user.role === 'BENEFICIARY') {
      beneficiaryProfile = db.prepare(`
        SELECT bp.*, u_coord.name as coordinator_name, u_coord.email as coordinator_email
        FROM beneficiary_profiles bp
        LEFT JOIN users u_coord ON bp.assigned_coordinator_id = u_coord.id
        WHERE bp.user_id = ?
      `).get(user.id);
    }

    return NextResponse.json({
      user: {
        ...user,
        beneficiaryProfile,
      },
    });
  } catch (error) {
    console.error('Me API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
