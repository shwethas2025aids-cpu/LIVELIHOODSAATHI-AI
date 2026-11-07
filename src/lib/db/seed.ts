/**
 * Seed data for LivelihoodSaathi AI Enterprise Backend
 * Generates realistic organizations, users across all 4 RBAC tiers, skills,
 * beneficiary profiles, assessments, training programmes, and progress history.
 */

import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import { INITIAL_SKILLS } from '@/lib/constants';

export function seedDatabase(db: DatabaseSync) {
  const existingOrg = db.prepare('SELECT COUNT(*) as count FROM organizations').get() as { count: number };
  if (existingOrg && existingOrg.count > 0) {
    return; // Already seeded
  }

  const now = new Date().toISOString();
  const defaultPasswordHash = bcrypt.hashSync('Password@123', 10);

  // 1. Seed Organizations
  const insertOrg = db.prepare(`
    INSERT OR IGNORE INTO organizations (
      id, name, slug, registration_number, type, contact_email, phone, address, district, state, verification_status, settings_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertOrg.run(
    'org-tnsrlm',
    'Tamil Nadu State Rural Livelihood Mission (TNSRLM)',
    'tnsrlm',
    'TN-SRLM-GOV-2023-8821',
    'Government Livelihood Programme',
    'admin@tnsrlm.org',
    '+91 44 2817 9900',
    'Mother Teresa Women Complex, Nungambakkam High Road',
    'Chennai',
    'Tamil Nadu',
    'VERIFIED',
    JSON.stringify({ autoEnroll: false, allowedDistricts: ['Chennai', 'Madurai', 'Trichy', 'Salem', 'Tirunelveli'] }),
    now,
    now
  );

  insertOrg.run(
    'org-aram',
    'Aram Skill Development Foundation',
    'aram-foundation',
    'NGO-TN-CBE-2019-4412',
    'Skill Development NGO',
    'admin@aramfoundation.org',
    '+91 422 245 7711',
    'Aram Campus, Trichy Road, Singanallur',
    'Coimbatore',
    'Tamil Nadu',
    'VERIFIED',
    JSON.stringify({ autoEnroll: true, allowedDistricts: ['Coimbatore', 'Tiruppur', 'Erode', 'Nilgiris'] }),
    now,
    now
  );

  // 2. Seed Users
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (
      id, organization_id, email, password_hash, name, phone, role, avatar, preferred_language, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Super Admin
  insertUser.run(
    'usr-superadmin',
    null,
    'superadmin@livelihoodsaathi.org',
    defaultPasswordHash,
    'Rajalakshmi Ramanathan (IAS Retd.)',
    '+91 94440 12345',
    'SUPER_ADMIN',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'ta-IN',
    1,
    now,
    now
  );

  // TNSRLM Users
  insertUser.run(
    'usr-tnsrlm-admin',
    'org-tnsrlm',
    'admin@tnsrlm.org',
    defaultPasswordHash,
    'Dr. K. Murugesan',
    '+91 98410 56789',
    'ORG_ADMIN',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'ta-IN',
    1,
    now,
    now
  );

  insertUser.run(
    'usr-tnsrlm-coord-1',
    'org-tnsrlm',
    'coordinator.madurai@tnsrlm.org',
    defaultPasswordHash,
    'Sundaram Vellingiri',
    '+91 97890 23456',
    'COORDINATOR',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'ta-IN',
    1,
    now,
    now
  );

  // Aram Foundation Users
  insertUser.run(
    'usr-aram-admin',
    'org-aram',
    'admin@aramfoundation.org',
    defaultPasswordHash,
    'Shanthi Sundaram',
    '+91 94433 77889',
    'ORG_ADMIN',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'en-IN',
    1,
    now,
    now
  );

  insertUser.run(
    'usr-aram-coord-1',
    'org-aram',
    'coordinator.kovai@aramfoundation.org',
    defaultPasswordHash,
    'P. Senthamarai Kannan',
    '+91 98944 33221',
    'COORDINATOR',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    'ta-IN',
    1,
    now,
    now
  );

  // Beneficiary Users
  insertUser.run(
    'usr-ben-shwetha',
    'org-tnsrlm',
    'shwetha.s@livelihoodsaathi.org',
    defaultPasswordHash,
    'Shwetha S',
    '+91 98765 43210',
    'BENEFICIARY',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'ta-IN',
    1,
    now,
    now
  );

  insertUser.run(
    'usr-ben-karthik',
    'org-tnsrlm',
    'karthik.r@ruralskills.tn',
    defaultPasswordHash,
    'Karthikeyan Ramasamy',
    '+91 94881 22334',
    'BENEFICIARY',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    'ta-IN',
    1,
    now,
    now
  );

  insertUser.run(
    'usr-ben-priya',
    'org-aram',
    'priya.m@ruralvoice.org',
    defaultPasswordHash,
    'Priya Meenakshi',
    '+91 97910 88776',
    'BENEFICIARY',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    'ta-en',
    1,
    now,
    now
  );

  insertUser.run(
    'usr-ben-anand',
    'org-aram',
    'anand.k@kovaiskills.org',
    defaultPasswordHash,
    'Anand Kumaravel',
    '+91 99420 55443',
    'BENEFICIARY',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    'ta-IN',
    1,
    now,
    now
  );

  insertUser.run(
    'usr-ben-divya',
    'org-tnsrlm',
    'divya.s@healthskills.tn',
    defaultPasswordHash,
    'Divya Subramaniam',
    '+91 96550 44332',
    'BENEFICIARY',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'en-IN',
    1,
    now,
    now
  );

  // 3. Seed Organization Members
  const insertMember = db.prepare(`
    INSERT INTO organization_members (id, organization_id, user_id, role, title, department, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertMember.run('mem-1', 'org-tnsrlm', 'usr-tnsrlm-admin', 'ORG_ADMIN', 'Joint Director & Scheme Head', 'Skill Training & Placement', now);
  insertMember.run('mem-2', 'org-tnsrlm', 'usr-tnsrlm-coord-1', 'COORDINATOR', 'Senior Field Coordinator', 'Madurai South Rural Block', now);
  insertMember.run('mem-3', 'org-aram', 'usr-aram-admin', 'ORG_ADMIN', 'Executive Director', 'Operations & Partnerships', now);
  insertMember.run('mem-4', 'org-aram', 'usr-aram-coord-1', 'COORDINATOR', 'Vocational Training Lead', 'Coimbatore Urban & Suburban Hub', now);

  // 4. Seed Skills Catalog
  const insertSkill = db.prepare(`
    INSERT OR IGNORE INTO skills (
      id, name, name_ta, category, demand_level, avg_salary_boost, description, description_ta, learning_duration_weeks, difficulty, prerequisites_json, tags_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const sk of INITIAL_SKILLS) {
    insertSkill.run(
      sk.id,
      sk.name,
      sk.nameTa || null,
      sk.category,
      sk.demandLevel,
      sk.avgSalaryBoost,
      sk.description,
      sk.descriptionTa || null,
      sk.learningDurationWeeks,
      sk.difficulty,
      JSON.stringify(sk.prerequisites || []),
      JSON.stringify(sk.tags || []),
      now
    );
  }

  // Add healthcare and business skills
  insertSkill.run(
    'skill-7',
    'General Duty Healthcare Assistant',
    'பொது சுகாதார உதவியாளர் மற்றும் முதலுதவி',
    'Healthcare',
    'Very High',
    '+30%',
    'Patient hygiene assistance, vital sign monitoring, infection control and basic first aid protocols.',
    'நோயாளிகளுக்கான பராமரிப்பு, முக்கிய உடலியல் அளவீடுகள் எடுத்தல் மற்றும் அடிப்படை அவசர முதலுதவி பயிற்சி.',
    8,
    'Beginner',
    JSON.stringify(['10th or 12th Standard']),
    JSON.stringify(['Healthcare', 'Hospital Care', 'Patient Support', 'First Aid']),
    now
  );

  insertSkill.run(
    'skill-8',
    'CNC Machine Programming & Operations',
    'சிஎன்சி இயந்திர இயக்கம் மற்றும் நிரலாக்கம்',
    'Vocational',
    'High',
    '+40%',
    'Operation of CNC lathe and milling machines, G-code/M-code programming and precision measurement tools.',
    'சிஎன்சி லேத் மற்றும் மில்லிங் மெஷின்களை இயக்குதல், துல்லிய அளவீடுகள் மற்றும் ஜி-கோடு புரோகிராமிங்.',
    10,
    'Intermediate',
    JSON.stringify(['ITI or Diploma in Mechanical/Automobile']),
    JSON.stringify(['Manufacturing', 'CNC', 'Machining', 'Industrial']),
    now
  );

  // 5. Seed Beneficiary Profiles
  const insertBen = db.prepare(`
    INSERT OR IGNORE INTO beneficiary_profiles (
      id, user_id, organization_id, assigned_coordinator_id, beneficiary_code, date_of_birth, gender, education_level, target_career, location, district, state, preferred_language, experience_years, employment_status, annual_income_bracket, notes, completed_assessment, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertBen.run(
    'ben-1',
    'usr-ben-shwetha',
    'org-tnsrlm',
    'usr-tnsrlm-coord-1',
    'BEN-TN-2026-001',
    '2003-05-14',
    'Female',
    'Bachelor of Technology (B.Tech - AI & DS)',
    'Full-Stack Developer & AI Solutions Specialist',
    'Madurai',
    'Madurai',
    'Tamil Nadu',
    'ta-IN',
    1.0,
    'STUDENT',
    'Below ₹1,00,000',
    'Strong analytical background; eager to work in rural tech empowerment or tech consulting.',
    1,
    now,
    now
  );

  insertBen.run(
    'ben-2',
    'usr-ben-karthik',
    'org-tnsrlm',
    'usr-tnsrlm-coord-1',
    'BEN-TN-2026-002',
    '2001-08-22',
    'Male',
    'Diploma in Mechanical Engineering',
    'Solar PV Installation & Energy Auditing Lead',
    'Melur, Madurai',
    'Madurai',
    'Tamil Nadu',
    'ta-IN',
    0.5,
    'UNEMPLOYED',
    'Below ₹1,50,000',
    'Looking for PMKVY certified rooftop solar installation programme with local contractor tie-ups.',
    1,
    now,
    now
  );

  insertBen.run(
    'ben-3',
    'usr-ben-priya',
    'org-aram',
    'usr-aram-coord-1',
    'BEN-ARAM-2026-001',
    '2002-11-09',
    'Female',
    'Higher Secondary School (+2 Commerce)',
    'Digital Commerce & Microenterprise Coordinator',
    'Singanallur',
    'Coimbatore',
    'Tamil Nadu',
    'ta-en',
    0.0,
    'UNEMPLOYED',
    'Below ₹1,00,000',
    'Wants to help local self-help group artisans sell handloom products on ONDC and WhatsApp Business.',
    1,
    now,
    now
  );

  insertBen.run(
    'ben-4',
    'usr-ben-anand',
    'org-aram',
    'usr-aram-coord-1',
    'BEN-ARAM-2026-002',
    '2000-03-18',
    'Male',
    'ITI Electrician',
    'Electric Vehicle (EV) Diagnostic Technician',
    'Pollachi Road',
    'Coimbatore',
    'Tamil Nadu',
    'ta-IN',
    1.5,
    'UNDEREMPLOYED',
    '₹1,00,000 - ₹2,00,000',
    'Currently works in conventional auto garage; wants to upgrade to lithium battery diagnostic skills.',
    1,
    now,
    now
  );

  insertBen.run(
    'ben-5',
    'usr-ben-divya',
    'org-tnsrlm',
    'usr-tnsrlm-coord-1',
    'BEN-TN-2026-003',
    '2002-01-30',
    'Female',
    'B.Sc Nursing (Final Year)',
    'Community Health and Elderly Care Coordinator',
    'Thirumangalam',
    'Madurai',
    'Tamil Nadu',
    'en-IN',
    0.0,
    'STUDENT',
    'Below ₹1,50,000',
    'Seeks specialized training in home-care technology and telemedicine platforms.',
    0,
    now,
    now
  );

  // 6. Seed Beneficiary Skills
  const insertBenSkill = db.prepare(`
    INSERT INTO beneficiary_skills (id, beneficiary_id, skill_id, proficiency_level, verified, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertBenSkill.run('bs-1', 'ben-1', 'skill-1', 'INTERMEDIATE', 1, now);
  insertBenSkill.run('bs-2', 'ben-1', 'skill-4', 'BEGINNER', 1, now);
  insertBenSkill.run('bs-3', 'ben-2', 'skill-2', 'BEGINNER', 0, now);
  insertBenSkill.run('bs-4', 'ben-3', 'skill-4', 'BEGINNER', 0, now);
  insertBenSkill.run('bs-5', 'ben-4', 'skill-3', 'INTERMEDIATE', 1, now);

  // 7. Seed Training Programmes
  const insertProg = db.prepare(`
    INSERT OR IGNORE INTO training_programmes (
      id, organization_id, title, title_ta, description, sector, skills_taught_json, eligibility, duration_weeks, start_date, end_date, total_seats, available_seats, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // TNSRLM Programmes
  insertProg.run(
    'prog-tnsrlm-solar',
    'org-tnsrlm',
    'Surya Mitra Rooftop Solar Technician Training',
    'சூரிய மித்ரா மேற்கூரை சோலார் டெக்னீஷியன் பயிற்சி',
    'Government supported 8-week intensive certification on solar photovoltaic array installation, inverter wiring, and safety standards.',
    'Green Skills',
    JSON.stringify(['Solar PV Installation & Maintenance', 'Electrical Safety', 'Battery Management']),
    '10th Pass or ITI/Diploma in Electrical/Mechanical',
    8,
    '2026-11-15',
    '2027-01-10',
    35,
    34,
    'ACTIVE',
    now,
    now
  );

  insertProg.run(
    'prog-tnsrlm-ai-dev',
    'org-tnsrlm',
    'Tamil Nadu Digital Upskilling: Full-Stack & Python for Youth',
    'டிஜிட்டல் திறன் மேம்பாடு: ஃபுல்-ஸ்டாக் மற்றும் பைதான் பயிற்சி',
    '12-week comprehensive coding boot camp covering Python scripting, modern Next.js/React full-stack development, and real-world database design.',
    'Tech',
    JSON.stringify(['Python for Data & Automation', 'Modern Web Development', 'SQL & Database Architecture']),
    'Graduate or Polytechnic Diploma in any technical stream',
    12,
    '2026-11-20',
    '2027-02-15',
    30,
    29,
    'ACTIVE',
    now,
    now
  );

  insertProg.run(
    'prog-tnsrlm-health',
    'org-tnsrlm',
    'Healthcare Assistant & Rural Telemedicine Support Track',
    'சுகாதார உதவியாளர் மற்றும் தொலைதூர மருத்துவ ஆதரவு பயிற்சி',
    '6-week practical training in vital monitoring, patient care ethics, and telemedicine portal usage.',
    'Healthcare',
    JSON.stringify(['General Duty Healthcare Assistant', 'Digital Health Record Keeping']),
    '12th Standard Science or Nursing/Allied Health Students',
    6,
    '2026-12-01',
    '2027-01-15',
    25,
    25,
    'ACTIVE',
    now,
    now
  );

  // Aram Foundation Programmes
  insertProg.run(
    'prog-aram-ev',
    'org-aram',
    'Electric Vehicle Diagnostics & Li-Ion Battery Maintenance',
    'மின்சார வாகனங்கள் பழுதுபார்ப்பு மற்றும் பேட்டரி மேலாண்மை பயிற்சி',
    '8-week hands-on industrial workshop on 2-wheeler/3-wheeler EV powertrains, brushless motor maintenance, and battery health diagnostics.',
    'Vocational',
    JSON.stringify(['Electric Vehicle Maintenance & Diagnostics', 'Battery Systems', 'Motor Controller Wiring']),
    'ITI Motor Mechanic / Electrician or 10th pass with auto workshop experience',
    8,
    '2026-11-10',
    '2027-01-05',
    25,
    24,
    'ACTIVE',
    now,
    now
  );

  insertProg.run(
    'prog-aram-digital',
    'org-aram',
    'Digital Entrepreneurship & WhatsApp Commerce for Rural SHGs',
    'சுய உதவிக்குழுக்களுக்கான டிஜிட்டல் தொழில்முனைவோர் பயிற்சி',
    '4-week practical programme guiding micro-entrepreneurs on catalog creation, UPI payments, social commerce, and bookkeeping.',
    'Business',
    JSON.stringify(['Digital Marketing for Microenterprises', 'Basic Bookkeeping', 'Customer Relationship Management']),
    'Open to all youth, SHG members and aspiring micro-entrepreneurs',
    4,
    '2026-11-12',
    '2026-12-10',
    40,
    39,
    'ACTIVE',
    now,
    now
  );

  // 8. Seed Training Enrollments
  const insertEnrollment = db.prepare(`
    INSERT INTO training_enrollments (
      id, programme_id, beneficiary_id, organization_id, status, enrolled_at, completion_date, attendance_pct, grade_or_remarks, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertEnrollment.run(
    'enr-1',
    'prog-tnsrlm-ai-dev',
    'ben-1',
    'org-tnsrlm',
    'IN_PROGRESS',
    now,
    null,
    94.5,
    'Consistently high assignment submissions in React and Python modules',
    now
  );

  insertEnrollment.run(
    'enr-2',
    'prog-tnsrlm-solar',
    'ben-2',
    'org-tnsrlm',
    'ENROLLED',
    now,
    null,
    100.0,
    'Admitted via Madurai Rural Block quota',
    now
  );

  insertEnrollment.run(
    'enr-3',
    'prog-aram-digital',
    'ben-3',
    'org-aram',
    'IN_PROGRESS',
    now,
    null,
    88.0,
    'Completed Module 1: Product Photography & WhatsApp Catalog',
    now
  );

  insertEnrollment.run(
    'enr-4',
    'prog-aram-ev',
    'ben-4',
    'org-aram',
    'IN_PROGRESS',
    now,
    null,
    92.0,
    'Strong practical aptitude in multimeter diagnostics and battery safety',
    now
  );

  // 9. Seed Career Assessments
  const insertAssess = db.prepare(`
    INSERT INTO career_assessments (
      id, beneficiary_id, organization_id, assessed_by_user_id, responses_json, dominant_domain, domain_scores_json, summary, summary_ta, matched_careers_json, top_skill_gaps_json, recommended_courses_json, next_steps_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAssess.run(
    'ass-ben-1',
    'ben-1',
    'org-tnsrlm',
    'usr-tnsrlm-coord-1',
    JSON.stringify({ q1: 'tech', q2: 'coding', q3: 'ai' }),
    'Tech',
    JSON.stringify({ Tech: 42, GreenSkills: 12, Vocational: 8, Business: 15, Healthcare: 5 }),
    'High aptitude for software engineering and machine learning deployment in social impact sectors.',
    'தகவல் தொழில்நுட்பம் மற்றும் சமூக நலம் சார்ந்த மென்பொருள் உருவாக்கத்தில் சிறந்த திறன் கொண்டவர்.',
    JSON.stringify([{ id: 'path-1', title: 'Full-Stack Developer & AI Specialist', matchScore: 94 }]),
    JSON.stringify([{ skill: 'Cloud Deployment (AWS/GCP)', priority: 'HIGH' }, { skill: 'REST API Optimization', priority: 'MEDIUM' }]),
    JSON.stringify([{ title: 'Next.js & TypeScript Production Guide', provider: 'SWAYAM' }]),
    JSON.stringify(['Complete ongoing Full-Stack module', 'Build a portfolio project for public welfare', 'Apply for certified internship']),
    now
  );

  insertAssess.run(
    'ass-ben-2',
    'ben-2',
    'org-tnsrlm',
    'usr-tnsrlm-coord-1',
    JSON.stringify({ q1: 'green', q2: 'fieldwork', q3: 'solar' }),
    'Green Skills',
    JSON.stringify({ Tech: 10, GreenSkills: 38, Vocational: 22, Business: 8, Healthcare: 2 }),
    'Ideal candidate for commercial and residential rooftop solar EPC installation.',
    'சூரிய சக்தி மேற்கூரை கட்டமைப்பு மற்றும் பசுமை மின் அமைப்புகள் நிறுவுவதில் அதிக ஆர்வம் உடையவர்.',
    JSON.stringify([{ id: 'path-2', title: 'Solar PV Installation & Energy Auditing Lead', matchScore: 91 }]),
    JSON.stringify([{ skill: 'Inverter Wiring & Grid Sync', priority: 'HIGH' }, { skill: 'Solar Site Surveying', priority: 'HIGH' }]),
    JSON.stringify([{ title: 'Surya Mitra Solar PV Technician', provider: 'PMKVY' }]),
    JSON.stringify(['Attend field demonstration at Madurai solar farm', 'Obtain MNRE certified technician badge', 'Register as local solar vendor']),
    now
  );

  // 10. Seed Skill Gaps
  const insertGap = db.prepare(`
    INSERT INTO skill_gaps (id, assessment_id, beneficiary_id, target_career, skill_id, skill_name, priority, status, created_at, resolved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertGap.run('gap-1', 'ass-ben-1', 'ben-1', 'Full-Stack Developer & AI Specialist', 'skill-5', 'Enterprise Relational DB Architecture', 'HIGH', 'IN_TRAINING', now, null);
  insertGap.run('gap-2', 'ass-ben-2', 'ben-2', 'Solar PV Installation & Energy Auditing Lead', 'skill-2', 'Solar PV Installation & Maintenance', 'HIGH', 'IN_TRAINING', now, null);

  // 11. Seed Structured Progress Records
  const insertProgress = db.prepare(`
    INSERT INTO progress_records (id, beneficiary_id, organization_id, recorded_by_user_id, milestone_title, milestone_type, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProgress.run(
    'prog-rec-1',
    'ben-1',
    'org-tnsrlm',
    'usr-tnsrlm-coord-1',
    'Baseline Career & Skills Assessment Completed',
    'ASSESSMENT',
    'Beneficiary scored 94% alignment with software & AI systems development. Enrolled into digital upskilling programme.',
    now
  );

  insertProgress.run(
    'prog-rec-2',
    'ben-1',
    'org-tnsrlm',
    'usr-tnsrlm-coord-1',
    'Enrolled in Tamil Nadu Digital Upskilling Programme',
    'TRAINING_START',
    'Commenced Module 1 with 94.5% attendance and active classroom participation.',
    now
  );

  insertProgress.run(
    'prog-rec-3',
    'ben-2',
    'org-tnsrlm',
    'usr-tnsrlm-coord-1',
    'Green Energy Vocational Assessment Completed',
    'ASSESSMENT',
    'Identified high interest in rooftop solar installations and subsidy facilitation for farmers.',
    now
  );

  // 12. Seed Coordinator Follow-up Records
  const insertFollowUp = db.prepare(`
    INSERT INTO follow_up_records (
      id, beneficiary_id, organization_id, coordinator_id, contact_date, channel, notes, next_action_date, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertFollowUp.run(
    'fu-1',
    'ben-1',
    'org-tnsrlm',
    'usr-tnsrlm-coord-1',
    '2026-11-04',
    'PHONE',
    'Spoke with Shwetha regarding capstone project progress. She is developing a civic AI guidance application. Advised her to submit for upcoming state hackathon.',
    '2026-11-18',
    'COMPLETED',
    now
  );

  insertFollowUp.run(
    'fu-2',
    'ben-2',
    'org-tnsrlm',
    'usr-tnsrlm-coord-1',
    '2026-11-02',
    'IN_PERSON',
    'Visited Melur village. Verified candidate certificates and explained stipend distribution rules under Surya Mitra scheme.',
    '2026-11-15',
    'COMPLETED',
    now
  );

  // 13. Seed Audit Logs
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, user_id, organization_id, action, resource_type, resource_id, details_json, ip_address, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAudit.run('aud-1', 'usr-tnsrlm-admin', 'org-tnsrlm', 'CREATE_TRAINING_PROGRAMME', 'training_programmes', 'prog-tnsrlm-solar', JSON.stringify({ title: 'Surya Mitra Solar' }), '127.0.0.1', now);
  insertAudit.run('aud-2', 'usr-tnsrlm-coord-1', 'org-tnsrlm', 'ENROLL_BENEFICIARY', 'training_enrollments', 'enr-1', JSON.stringify({ beneficiary: 'ben-1', programme: 'prog-tnsrlm-ai-dev' }), '127.0.0.1', now);
}
