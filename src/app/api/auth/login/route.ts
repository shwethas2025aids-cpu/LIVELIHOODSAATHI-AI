export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db, logAuditEvent } from '@/lib/db';
import { verifyPassword, createToken, TokenPayload } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const emailTrimmed = email.trim().toLowerCase();

    // Fetch user
    const user = db.prepare(`
      SELECT u.*, o.name as org_name, o.slug as org_slug, o.type as org_type
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.email = ?
    `).get(emailTrimmed) as (Record<string, unknown> & { password_hash: string; id: string; role: string; organization_id: string | null; name: string; is_active: number }) | undefined;

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials. User not found.' },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is deactivated. Contact organization administrator.' },
        { status: 403 }
      );
    }

    // Verify password
    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid credentials. Incorrect password.' },
        { status: 401 }
      );
    }

    // Fetch beneficiary profile if user is a beneficiary
    let beneficiaryProfile = null;
    if (user.role === 'BENEFICIARY') {
      beneficiaryProfile = db.prepare(`
        SELECT bp.*, u_coord.name as coordinator_name, u_coord.email as coordinator_email
        FROM beneficiary_profiles bp
        LEFT JOIN users u_coord ON bp.assigned_coordinator_id = u_coord.id
        WHERE bp.user_id = ?
      `).get(user.id);
    }

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email as string,
      role: user.role as TokenPayload['role'],
      organizationId: user.organization_id,
      name: user.name,
    };

    const token = createToken(tokenPayload);

    logAuditEvent({
      userId: user.id,
      organizationId: user.organization_id,
      action: 'USER_LOGIN',
      resourceType: 'users',
      resourceId: user.id,
      details: { role: user.role },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        organizationId: user.organization_id,
        organizationName: user.org_name,
        preferredLanguage: user.preferred_language,
        avatar: user.avatar,
        beneficiaryProfile,
      },
    });

    // Set HTTP cookie for seamless SSR session support
    response.cookies.set('saathi_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'Internal server error during authentication.' }, { status: 500 });
  }
}
