/**
 * LivelihoodSaathi AI - Enterprise Relational Database Schema
 * Multi-organization data isolation, RBAC, beneficiary tracking, assessments,
 * training programmes, skill gaps, progress timelines, and audit logs.
 */

export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  registration_number TEXT,
  type TEXT NOT NULL DEFAULT 'NGO',
  contact_email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  district TEXT,
  state TEXT DEFAULT 'Tamil Nadu',
  verification_status TEXT DEFAULT 'VERIFIED',
  settings_json TEXT DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 2. Users (Platform users: SuperAdmin, OrgAdmin, Coordinator, Beneficiary)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'BENEFICIARY',
  avatar TEXT,
  preferred_language TEXT DEFAULT 'ta-IN',
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 3. Organization Members (Admins & Coordinators)
CREATE TABLE IF NOT EXISTS organization_members (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  title TEXT,
  department TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(organization_id, user_id)
);

-- 4. Beneficiary Profiles
CREATE TABLE IF NOT EXISTS beneficiary_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  assigned_coordinator_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  beneficiary_code TEXT UNIQUE,
  date_of_birth TEXT,
  gender TEXT,
  education_level TEXT,
  target_career TEXT,
  location TEXT,
  district TEXT,
  state TEXT DEFAULT 'Tamil Nadu',
  preferred_language TEXT DEFAULT 'ta-IN',
  experience_years REAL DEFAULT 0,
  employment_status TEXT DEFAULT 'UNEMPLOYED',
  annual_income_bracket TEXT,
  notes TEXT,
  completed_assessment INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 5. Standardized Skills Catalog
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ta TEXT,
  category TEXT NOT NULL,
  demand_level TEXT DEFAULT 'High',
  avg_salary_boost TEXT,
  description TEXT NOT NULL,
  description_ta TEXT,
  learning_duration_weeks INTEGER DEFAULT 4,
  difficulty TEXT DEFAULT 'Beginner',
  prerequisites_json TEXT DEFAULT '[]',
  tags_json TEXT DEFAULT '[]',
  created_at TEXT NOT NULL
);

-- 6. Beneficiary Acquired Skills
CREATE TABLE IF NOT EXISTS beneficiary_skills (
  id TEXT PRIMARY KEY,
  beneficiary_id TEXT NOT NULL REFERENCES beneficiary_profiles(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level TEXT DEFAULT 'BEGINNER',
  verified INTEGER DEFAULT 0,
  acquired_via_programme_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(beneficiary_id, skill_id)
);

-- 7. Career Assessments (Evon + Scikit-Learn Hybrid Evaluations)
CREATE TABLE IF NOT EXISTS career_assessments (
  id TEXT PRIMARY KEY,
  beneficiary_id TEXT NOT NULL REFERENCES beneficiary_profiles(id) ON DELETE CASCADE,
  organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  assessed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  responses_json TEXT NOT NULL DEFAULT '{}',
  dominant_domain TEXT NOT NULL,
  domain_scores_json TEXT NOT NULL DEFAULT '{}',
  summary TEXT NOT NULL,
  summary_ta TEXT,
  matched_careers_json TEXT NOT NULL DEFAULT '[]',
  top_skill_gaps_json TEXT NOT NULL DEFAULT '[]',
  recommended_courses_json TEXT NOT NULL DEFAULT '[]',
  next_steps_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL
);

-- 8. Identified Skill Gaps
CREATE TABLE IF NOT EXISTS skill_gaps (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL REFERENCES career_assessments(id) ON DELETE CASCADE,
  beneficiary_id TEXT NOT NULL REFERENCES beneficiary_profiles(id) ON DELETE CASCADE,
  target_career TEXT NOT NULL,
  skill_id TEXT REFERENCES skills(id) ON DELETE SET NULL,
  skill_name TEXT NOT NULL,
  priority TEXT DEFAULT 'HIGH',
  status TEXT DEFAULT 'IDENTIFIED',
  created_at TEXT NOT NULL,
  resolved_at TEXT
);

-- 9. Training Programmes (Created & run by Organizations)
CREATE TABLE IF NOT EXISTS training_programmes (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_ta TEXT,
  description TEXT NOT NULL,
  sector TEXT NOT NULL,
  skills_taught_json TEXT NOT NULL DEFAULT '[]',
  eligibility TEXT,
  duration_weeks INTEGER DEFAULT 8,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  total_seats INTEGER NOT NULL DEFAULT 30,
  available_seats INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 10. Training Enrollments
CREATE TABLE IF NOT EXISTS training_enrollments (
  id TEXT PRIMARY KEY,
  programme_id TEXT NOT NULL REFERENCES training_programmes(id) ON DELETE CASCADE,
  beneficiary_id TEXT NOT NULL REFERENCES beneficiary_profiles(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ENROLLED',
  enrolled_at TEXT NOT NULL,
  completion_date TEXT,
  attendance_pct REAL DEFAULT 0,
  grade_or_remarks TEXT,
  updated_at TEXT NOT NULL,
  UNIQUE(programme_id, beneficiary_id)
);

-- 11. Structured Beneficiary Progress Records (Timeline)
CREATE TABLE IF NOT EXISTS progress_records (
  id TEXT PRIMARY KEY,
  beneficiary_id TEXT NOT NULL REFERENCES beneficiary_profiles(id) ON DELETE CASCADE,
  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  recorded_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  milestone_title TEXT NOT NULL,
  milestone_type TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL
);

-- 12. Follow-Up Records (Coordinators)
CREATE TABLE IF NOT EXISTS follow_up_records (
  id TEXT PRIMARY KEY,
  beneficiary_id TEXT NOT NULL REFERENCES beneficiary_profiles(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  coordinator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_date TEXT NOT NULL,
  channel TEXT DEFAULT 'PHONE',
  notes TEXT NOT NULL,
  next_action_date TEXT,
  status TEXT DEFAULT 'COMPLETED',
  created_at TEXT NOT NULL
);

-- 13. Audit Logs (Enterprise security & compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details_json TEXT DEFAULT '{}',
  ip_address TEXT,
  created_at TEXT NOT NULL
);

-- 14. Conversations & Voice Transcripts (Preserving Gnani Prisma & Voice records)
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  language TEXT DEFAULT 'ta-IN',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS voice_transcripts (
  id TEXT PRIMARY KEY,
  conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  segment_id TEXT NOT NULL,
  audio_duration_ms INTEGER DEFAULT 0,
  original_transcript TEXT NOT NULL,
  normalized_text TEXT,
  language TEXT DEFAULT 'ta-IN',
  confidence REAL DEFAULT 0.95,
  is_final INTEGER DEFAULT 1,
  provider TEXT DEFAULT 'gnani-prisma-v3',
  created_at TEXT NOT NULL
);

-- Indexes for high-throughput multi-tenant isolation
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_org ON beneficiary_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_coord ON beneficiary_profiles(assigned_coordinator_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_code ON beneficiary_profiles(beneficiary_code);
CREATE INDEX IF NOT EXISTS idx_assessments_ben ON career_assessments(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_assessments_org ON career_assessments(organization_id);
CREATE INDEX IF NOT EXISTS idx_skill_gaps_ben ON skill_gaps(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_training_prog_org ON training_programmes(organization_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_prog ON training_enrollments(programme_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_ben ON training_enrollments(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_org ON training_enrollments(organization_id);
CREATE INDEX IF NOT EXISTS idx_progress_ben ON progress_records(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_progress_org ON progress_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_ben ON follow_up_records(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_org ON follow_up_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_logs(organization_id);
`;

