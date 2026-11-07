export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db, logAuditEvent } from '@/lib/db';
import { requireAuth, resolveScopedOrgId, enforceOrgScope } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if ('errorResponse' in auth) {
      return auth.errorResponse;
    }

    const { user } = auth;
    const url = new URL(req.url);
    const sector = url.searchParams.get('sector');
    const status = url.searchParams.get('status');

    const scopedOrgId = resolveScopedOrgId(user, url.searchParams.get('organizationId'));

    let sql = `
      SELECT tp.*,
             o.name as organization_name,
             (SELECT COUNT(*) FROM training_enrollments WHERE programme_id = tp.id) as enrolled_count,
             (SELECT COUNT(*) FROM training_enrollments WHERE programme_id = tp.id AND status = 'COMPLETED') as completed_count
      FROM training_programmes tp
      JOIN organizations o ON tp.organization_id = o.id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (scopedOrgId) {
      sql += ' AND tp.organization_id = ?';
      params.push(scopedOrgId);
    } else if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ programmes: [] });
    }

    if (sector) {
      sql += ' AND tp.sector = ?';
      params.push(sector);
    }

    if (status) {
      sql += ' AND tp.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY tp.created_at DESC';

    const programmes = db.prepare(sql).all(...params).map((p: any) => ({
      ...p,
      skills_taught: JSON.parse(p.skills_taught_json || '[]'),
    }));

    return NextResponse.json({ programmes });
  } catch (error) {
    console.error('List Programmes Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve training programmes.' }, { status: 500 });
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
      title,
      titleTa,
      description,
      sector = 'Tech',
      skillsTaught = [],
      eligibility,
      durationWeeks = 8,
      startDate,
      endDate,
      totalSeats = 30,
      organizationId,
    } = body;

    if (!title || !description || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'title, description, startDate, and endDate are required.' },
        { status: 400 }
      );
    }

    const targetOrgId = user.role === 'SUPER_ADMIN' ? (organizationId || user.organizationId) : user.organizationId;
    if (!targetOrgId) {
      return NextResponse.json({ error: 'organizationId is required.' }, { status: 400 });
    }

    if (!enforceOrgScope(user, targetOrgId)) {
      return NextResponse.json({ error: 'Forbidden: Cannot create programmes in another organization.' }, { status: 403 });
    }

    const id = `prog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO training_programmes (
        id, organization_id, title, title_ta, description, sector, skills_taught_json, eligibility, duration_weeks, start_date, end_date, total_seats, available_seats, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
    `).run(
      id,
      targetOrgId,
      title.trim(),
      titleTa || null,
      description.trim(),
      sector,
      JSON.stringify(skillsTaught),
      eligibility || null,
      durationWeeks,
      startDate,
      endDate,
      totalSeats,
      totalSeats,
      now,
      now
    );

    logAuditEvent({
      userId: user.userId,
      organizationId: targetOrgId,
      action: 'TRAINING_PROGRAMME_CREATED',
      resourceType: 'training_programmes',
      resourceId: id,
      details: { title, sector, totalSeats },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Training programme created successfully',
        programme: {
          id,
          organizationId: targetOrgId,
          title,
          sector,
          totalSeats,
          availableSeats: totalSeats,
          startDate,
          endDate,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create Programme Error:', error);
    return NextResponse.json({ error: 'Failed to create training programme.' }, { status: 500 });
  }
}
