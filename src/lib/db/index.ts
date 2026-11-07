/**
 * LivelihoodSaathi AI - Enterprise Database Access Layer
 * Uses Node 24 native node:sqlite DatabaseSync with ACID guarantees,
 * strict multi-tenant isolation, parameterized queries, and audit logging.
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { SCHEMA_SQL } from './schema';
import { seedDatabase } from './seed';

// Type definitions for DB entities
export interface DbOrganization {
  id: string;
  name: string;
  slug: string;
  registration_number: string | null;
  type: string;
  contact_email: string;
  phone: string | null;
  address: string | null;
  district: string | null;
  state: string;
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  settings_json: string;
  created_at: string;
  updated_at: string;
}

export interface DbUser {
  id: string;
  organization_id: string | null;
  email: string;
  password_hash: string;
  name: string;
  phone: string | null;
  role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'COORDINATOR' | 'BENEFICIARY';
  avatar: string | null;
  preferred_language: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface DbBeneficiaryProfile {
  id: string;
  user_id: string;
  organization_id: string | null;
  assigned_coordinator_id: string | null;
  beneficiary_code: string | null;
  date_of_birth: string | null;
  gender: string | null;
  education_level: string | null;
  target_career: string | null;
  location: string | null;
  district: string | null;
  state: string;
  preferred_language: string;
  experience_years: number;
  employment_status: string;
  annual_income_bracket: string | null;
  notes: string | null;
  completed_assessment: number;
  created_at: string;
  updated_at: string;
}

export interface DbTrainingProgramme {
  id: string;
  organization_id: string;
  title: string;
  title_ta: string | null;
  description: string;
  sector: string;
  skills_taught_json: string;
  eligibility: string | null;
  duration_weeks: number;
  start_date: string;
  end_date: string;
  total_seats: number;
  available_seats: number;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}

export interface DbTrainingEnrollment {
  id: string;
  programme_id: string;
  beneficiary_id: string;
  organization_id: string;
  status: 'NOT_STARTED' | 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';
  enrolled_at: string;
  completion_date: string | null;
  attendance_pct: number;
  grade_or_remarks: string | null;
  updated_at: string;
}

// Global singleton to prevent multiple open handles during Next.js live reloads
declare global {
  // eslint-disable-next-line no-var
  var __saathi_db: DatabaseSync | undefined;
}

function getDatabase(): DatabaseSync {
  if (globalThis.__saathi_db) {
    return globalThis.__saathi_db;
  }

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'livelihoodsaathi.db');
  const db = new DatabaseSync(dbPath);

  try {
    db.exec('PRAGMA busy_timeout = 30000;');
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');
  } catch {
    // Busy timeout / WAL already active
  }

  try {
    // Run schema migrations
    db.exec(SCHEMA_SQL);

    // Seed baseline organizations and users if empty
    seedDatabase(db);
  } catch (err: any) {
    // If another thread is already initializing, allow busy timeout to settle
    if (!err?.message?.includes('locked')) {
      console.warn('[DB Init Warning]', err.message);
    }
  }

  globalThis.__saathi_db = db;
  return db;
}

export const db = getDatabase();

/**
 * Log audit events for compliance & security
 */
export function logAuditEvent(params: {
  userId?: string | null;
  organizationId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
}) {
  try {
    const insert = db.prepare(`
      INSERT INTO audit_logs (id, user_id, organization_id, action, resource_type, resource_id, details_json, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const id = `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    insert.run(
      id,
      params.userId || null,
      params.organizationId || null,
      params.action,
      params.resourceType,
      params.resourceId || null,
      JSON.stringify(params.details || {}),
      params.ipAddress || null,
      new Date().toISOString()
    );
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
