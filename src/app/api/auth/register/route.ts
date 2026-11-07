export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db, logAuditEvent } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      role = 'BENEFICIARY',
      organizationId,
      phone,
      preferredLanguage = 'ta-IN',
      educationLevel,
      targetCareer,
      district = 'Chennai',
      state = 'Tamil Nadu',
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required fields.' },
        { status: 400 }
      );
    }

    const emailTrimmed = email.trim().toLowerCase();

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(emailTrimmed);
    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email already exists.' },
        { status: 409 }
      );
    }

    // Validate organization if provided
    let validOrgId: string | null = null;
    if (organizationId) {
      const org = db.prepare('SELECT id FROM organizations WHERE id = ?').get(organizationId);
      if (!org) {
        return NextResponse.json(
          { error: 'Specified organization does not exist.' },
          { status: 400 }
        );
      }
      validOrgId = organizationId;
    }

    // Role validation: Non-admin public registration defaults to BENEFICIARY unless authorized
    const validRole = ['BENEFICIARY', 'COORDINATOR', 'ORG_ADMIN'].includes(role) ? role : 'BENEFICIARY';

    const userId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const passwordHash = hashPassword(password);

    // Create user
    db.prepare(`
      INSERT INTO users (
        id, organization_id, email, password_hash, name, phone, role, preferred_language, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(userId, validOrgId, emailTrimmed, passwordHash, name.trim(), phone || null, validRole, preferredLanguage, now, now);

    // If role is BENEFICIARY, create corresponding beneficiary profile
    let beneficiaryId: string | null = null;
    if (validRole === 'BENEFICIARY') {
      beneficiaryId = `ben-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const benCode = `BEN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      db.prepare(`
        INSERT INTO beneficiary_profiles (
          id, user_id, organization_id, beneficiary_code, education_level, target_career, location, district, state, preferred_language, completed_assessment, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      `).run(
        beneficiaryId,
        userId,
        validOrgId,
        benCode,
        educationLevel || null,
        targetCareer || null,
        district,
        district,
        state,
        preferredLanguage,
        now,
        now
      );
    } else if (validOrgId && (validRole === 'ORG_ADMIN' || validRole === 'COORDINATOR')) {
      // Create organization member record
      const memberId = `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      db.prepare(`
        INSERT INTO organization_members (
          id, organization_id, user_id, role, title, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(memberId, validOrgId, userId, validRole, validRole === 'ORG_ADMIN' ? 'Organization Admin' : 'Program Coordinator', now);
    }

    logAuditEvent({
      userId,
      organizationId: validOrgId,
      action: 'USER_REGISTERED',
      resourceType: 'users',
      resourceId: userId,
      details: { role: validRole, email: emailTrimmed },
    });

    const token = createToken({
      userId,
      email: emailTrimmed,
      role: validRole as 'SUPER_ADMIN' | 'ORG_ADMIN' | 'COORDINATOR' | 'BENEFICIARY',
      organizationId: validOrgId,
      name: name.trim(),
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: emailTrimmed,
        role: validRole,
        organizationId: validOrgId,
        preferredLanguage,
        beneficiaryId,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json({ error: 'Internal server error during registration.' }, { status: 500 });
  }
}
