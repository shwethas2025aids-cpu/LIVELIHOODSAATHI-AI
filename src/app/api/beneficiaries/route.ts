export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db, logAuditEvent } from '@/lib/db';
import { requireAuth, resolveScopedOrgId, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req, ['SUPER_ADMIN', 'ORG_ADMIN', 'COORDINATOR']);
    if ('errorResponse' in auth) {
      return auth.errorResponse;
    }

    const { user } = auth;
    const url = new URL(req.url);

    const q = url.searchParams.get('q');
    const education = url.searchParams.get('education');
    const employmentStatus = url.searchParams.get('employment_status');
    const district = url.searchParams.get('district');
    const coordinatorId = url.searchParams.get('coordinator_id');
    const completedAssessment = url.searchParams.get('completed_assessment');
    const myAssignedOnly = url.searchParams.get('myAssignedOnly') === 'true';

    // Resolve tenant organization scope
    const scopedOrgId = resolveScopedOrgId(user, url.searchParams.get('organizationId'));

    let sql = `
      SELECT bp.*,
             u.name, u.email, u.phone, u.avatar, u.is_active,
             o.name as organization_name,
             u_coord.name as coordinator_name, u_coord.email as coordinator_email,
             (SELECT COUNT(*) FROM career_assessments WHERE beneficiary_id = bp.id) as assessment_count,
             (SELECT COUNT(*) FROM training_enrollments WHERE beneficiary_id = bp.id) as enrollment_count,
             (SELECT COUNT(*) FROM skill_gaps WHERE beneficiary_id = bp.id AND status = 'IDENTIFIED') as open_skill_gaps_count
      FROM beneficiary_profiles bp
      JOIN users u ON bp.user_id = u.id
      LEFT JOIN organizations o ON bp.organization_id = o.id
      LEFT JOIN users u_coord ON bp.assigned_coordinator_id = u_coord.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    // Tenant isolation: ORG_ADMIN and COORDINATOR must only see their organization
    if (scopedOrgId) {
      sql += ' AND bp.organization_id = ?';
      params.push(scopedOrgId);
    } else if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ beneficiaries: [] });
    }

    // Filter by coordinator
    if (myAssignedOnly && user.role === 'COORDINATOR') {
      sql += ' AND bp.assigned_coordinator_id = ?';
      params.push(user.userId);
    } else if (coordinatorId) {
      sql += ' AND bp.assigned_coordinator_id = ?';
      params.push(coordinatorId);
    }

    // Filter by education
    if (education) {
      sql += ' AND bp.education_level LIKE ?';
      params.push(`%${education}%`);
    }

    // Filter by employment status
    if (employmentStatus) {
      sql += ' AND bp.employment_status = ?';
      params.push(employmentStatus);
    }

    // Filter by district
    if (district) {
      sql += ' AND bp.district = ?';
      params.push(district);
    }

    // Filter by completed assessment
    if (completedAssessment !== null && completedAssessment !== undefined && completedAssessment !== '') {
      sql += ' AND bp.completed_assessment = ?';
      params.push(completedAssessment === 'true' || completedAssessment === '1' ? 1 : 0);
    }

    // Text search
    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      sql += ' AND (u.name LIKE ? OR u.email LIKE ? OR bp.beneficiary_code LIKE ? OR u.phone LIKE ? OR bp.target_career LIKE ?)';
      params.push(term, term, term, term, term);
    }

    sql += ' ORDER BY bp.created_at DESC';

    const beneficiaries = db.prepare(sql).all(...params);

    return NextResponse.json({ beneficiaries });
  } catch (error) {
    console.error('List Beneficiaries Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve beneficiaries.' }, { status: 500 });
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
    const {
      name,
      email,
      phone,
      password = 'Password@123',
      dateOfBirth,
      gender,
      educationLevel,
      targetCareer,
      district = 'Madurai',
      location,
      state = 'Tamil Nadu',
      preferredLanguage = 'ta-IN',
      experienceYears = 0,
      employmentStatus = 'UNEMPLOYED',
      annualIncomeBracket,
      notes,
      assignedCoordinatorId,
      initialSkills = [],
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Beneficiary name and email are required.' },
        { status: 400 }
      );
    }

    const emailTrimmed = email.trim().toLowerCase();

    // Check existing email
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(emailTrimmed);
    if (existing) {
      return NextResponse.json(
        { error: 'A beneficiary or user with this email address already exists.' },
        { status: 409 }
      );
    }

    // Scope to organization
    const orgId = user.role === 'SUPER_ADMIN' ? (body.organizationId || null) : user.organizationId;

    const newUserId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const beneficiaryId = `ben-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const benCode = `BEN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const passwordHash = hashPassword(password);

    // Create user
    db.prepare(`
      INSERT INTO users (
        id, organization_id, email, password_hash, name, phone, role, preferred_language, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'BENEFICIARY', ?, 1, ?, ?)
    `).run(newUserId, orgId, emailTrimmed, passwordHash, name.trim(), phone || null, preferredLanguage, now, now);

    // Create beneficiary profile
    const coordinatorToAssign = assignedCoordinatorId || (user.role === 'COORDINATOR' ? user.userId : null);

    db.prepare(`
      INSERT INTO beneficiary_profiles (
        id, user_id, organization_id, assigned_coordinator_id, beneficiary_code, date_of_birth, gender, education_level, target_career, location, district, state, preferred_language, experience_years, employment_status, annual_income_bracket, notes, completed_assessment, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(
      beneficiaryId,
      newUserId,
      orgId,
      coordinatorToAssign,
      benCode,
      dateOfBirth || null,
      gender || null,
      educationLevel || null,
      targetCareer || null,
      location || district,
      district,
      state,
      preferredLanguage,
      experienceYears,
      employmentStatus,
      annualIncomeBracket || null,
      notes || null,
      now,
      now
    );

    // Seed initial skills if provided
    if (Array.isArray(initialSkills) && initialSkills.length > 0) {
      const insertSkill = db.prepare(`
        INSERT OR IGNORE INTO beneficiary_skills (id, beneficiary_id, skill_id, proficiency_level, verified, created_at)
        VALUES (?, ?, ?, 'BEGINNER', 0, ?)
      `);
      for (const skId of initialSkills) {
        insertSkill.run(`bs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, beneficiaryId, skId, now);
      }
    }

    // Log progress record
    db.prepare(`
      INSERT INTO progress_records (id, beneficiary_id, organization_id, recorded_by_user_id, milestone_title, milestone_type, notes, created_at)
      VALUES (?, ?, ?, ?, 'Beneficiary Registered in Platform', 'REGISTRATION', ?, ?)
    `).run(
      `prog-${Date.now()}`,
      beneficiaryId,
      orgId,
      user.userId,
      `Registered by ${user.name} (${user.role}). Beneficiary Code: ${benCode}`,
      now
    );

    logAuditEvent({
      userId: user.userId,
      organizationId: orgId,
      action: 'BENEFICIARY_REGISTERED',
      resourceType: 'beneficiary_profiles',
      resourceId: beneficiaryId,
      details: { name: name.trim(), email: emailTrimmed, beneficiaryCode: benCode },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Beneficiary registered successfully',
        beneficiary: {
          id: beneficiaryId,
          userId: newUserId,
          beneficiaryCode: benCode,
          name: name.trim(),
          email: emailTrimmed,
          organizationId: orgId,
          assignedCoordinatorId: coordinatorToAssign,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create Beneficiary Error:', error);
    return NextResponse.json({ error: 'Failed to create beneficiary.' }, { status: 500 });
  }
}
