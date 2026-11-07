/**
 * LivelihoodSaathi AI - Enterprise Backend Verification Test Suite
 * Tests:
 * 1. Health & OpenAPI Specification
 * 2. Multi-tier Authentication (SUPER_ADMIN, ORG_ADMIN, COORDINATOR, BENEFICIARY)
 * 3. Strict Multi-Tenant Data Isolation (Cross-tenant access prevention)
 * 4. Beneficiary Management & Coordinator Caseload Filtering
 * 5. Scikit-Learn TF-IDF Cosine Similarity + Gnani Evon 30B Assessment
 * 6. Training Programme & Capacity Management (Seats & Enrollment lifecycle)
 * 7. Structured Beneficiary Progress & Coordinator Follow-up History
 * 8. Real Database-Driven Enterprise Analytics
 * 9. REST STT, TTS, and Chat Guidance
 * 10. Real-time Voice WebSocket Streaming
 */

const { WebSocket } = require('ws');

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const WS_URL = process.env.TEST_WS_URL || 'ws://127.0.0.1:3000/api/voice/stream';

let superAdminToken = '';
let tnsrlmAdminToken = '';
let aramAdminToken = '';
let coordinatorToken = '';
let beneficiaryToken = '';
let createdBeneficiaryId = '';
let createdProgrammeId = '';
let createdEnrollmentId = '';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (!condition) {
    failedTests++;
    console.error(`  ❌ FAILED: ${message}`);
    throw new Error(message);
  } else {
    passedTests++;
    console.log(`  ✓ PASSED: ${message}`);
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 LIVELIHOODSAATHI AI - ENTERPRISE BACKEND VERIFICATION SUITE');
  console.log('Base URL:', BASE_URL);
  console.log('================================================================\n');

  // ---------------------------------------------------------------------------
  // 1. Real-time Voice WebSocket Proxy
  // ---------------------------------------------------------------------------
  console.log('--- TEST GROUP 1: Real-time Voice WebSocket Streaming ---');

  await new Promise((resolve, reject) => {
    try {
      const ws = new WebSocket(`${WS_URL}?lang=ta-IN`);
      let gotConnected = false;
      let gotSpeechStart = false;
      let gotTranscript = false;
      let gotFinalTranscript = false;

      ws.on('open', () => {
        console.log('  ✓ Connected to real-time voice streaming WebSocket');
      });

      ws.on('message', (msg) => {
        try {
          const event = JSON.parse(msg.toString());
          if (event.type === 'connected') {
            gotConnected = true;
            let frameCount = 0;
            const interval = setInterval(() => {
              frameCount++;
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(Buffer.alloc(1024), { binary: true });
              }

              if (frameCount >= 15) {
                clearInterval(interval);
                setTimeout(() => {
                  if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ action: 'stop' }));
                  }
                }, 100);
              }
            }, 50);
          } else if (event.type === 'speech_start') {
            gotSpeechStart = true;
          } else if (event.type === 'transcript') {
            gotTranscript = true;
            if (event.is_final) {
              gotFinalTranscript = true;
              setTimeout(() => {
                ws.close(1000, 'Test completed');
              }, 100);
            }
          }
        } catch (err) {
          console.error('Error parsing WS message:', err);
        }
      });

      ws.on('close', (code, reason) => {
        try {
          assert(gotConnected, 'WebSocket received "connected" event');
          assert(gotSpeechStart, 'WebSocket received "speech_start" event upon audio frames');
          assert(gotTranscript, 'WebSocket received real-time "transcript" events');
          assert(gotFinalTranscript, 'WebSocket received finalized utterance segment');
          resolve();
        } catch (e) {
          reject(e);
        }
      });

      ws.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });

  // ---------------------------------------------------------------------------
  // 2. OpenAPI Documentation & Health Check
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: OpenAPI 3.1 & Health Check ---');
  const docsRes = await fetch(`${BASE_URL}/api/docs`, {
    headers: { Accept: 'application/json' },
  });
  assert(docsRes.status === 200, '/api/docs returns HTTP 200');
  const docsData = await docsRes.json();
  assert(docsData.openapi === '3.1.0', 'OpenAPI specification version is 3.1.0');
  assert(Boolean(docsData.paths['/beneficiaries']), 'OpenAPI defines /beneficiaries path');
  assert(Boolean(docsData.paths['/analytics/dashboard']), 'OpenAPI defines /analytics/dashboard path');

  // ---------------------------------------------------------------------------
  // 3. Authentication & Multi-Tier RBAC
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Authentication & RBAC ---');

  // 2.1 Super Admin Login
  const superLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superadmin@livelihoodsaathi.org', password: 'Password@123' }),
  });
  assert(superLoginRes.status === 200, 'SuperAdmin login returns HTTP 200');
  const superLoginData = await superLoginRes.json();
  assert(superLoginData.user.role === 'SUPER_ADMIN', 'SuperAdmin role is SUPER_ADMIN');
  superAdminToken = superLoginData.token;

  // 2.2 TNSRLM Org Admin Login
  const tnsrlmLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@tnsrlm.org', password: 'Password@123' }),
  });
  assert(tnsrlmLoginRes.status === 200, 'TNSRLM OrgAdmin login returns HTTP 200');
  const tnsrlmLoginData = await tnsrlmLoginRes.json();
  assert(tnsrlmLoginData.user.role === 'ORG_ADMIN', 'TNSRLM Admin role is ORG_ADMIN');
  assert(tnsrlmLoginData.user.organizationId === 'org-tnsrlm', 'TNSRLM Admin bound to org-tnsrlm');
  tnsrlmAdminToken = tnsrlmLoginData.token;

  // 2.3 Aram Foundation Org Admin Login
  const aramLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@aramfoundation.org', password: 'Password@123' }),
  });
  assert(aramLoginRes.status === 200, 'Aram OrgAdmin login returns HTTP 200');
  const aramLoginData = await aramLoginRes.json();
  assert(aramLoginData.user.organizationId === 'org-aram', 'Aram Admin bound to org-aram');
  aramAdminToken = aramLoginData.token;

  // 2.4 TNSRLM Coordinator Login
  const coordLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'coordinator.madurai@tnsrlm.org', password: 'Password@123' }),
  });
  assert(coordLoginRes.status === 200, 'Coordinator login returns HTTP 200');
  const coordData = await coordLoginRes.json();
  assert(coordData.user.role === 'COORDINATOR', 'Coordinator role verified');
  coordinatorToken = coordData.token;

  // 2.5 Beneficiary Login
  const benLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'shwetha.s@livelihoodsaathi.org', password: 'Password@123' }),
  });
  assert(benLoginRes.status === 200, 'Beneficiary login returns HTTP 200');
  const benData = await benLoginRes.json();
  assert(benData.user.role === 'BENEFICIARY', 'Beneficiary role verified');
  assert(Boolean(benData.user.beneficiaryProfile), 'Beneficiary profile returned upon login');
  beneficiaryToken = benData.token;

  // 2.6 /api/auth/me Profile Check
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${beneficiaryToken}` },
  });
  assert(meRes.status === 200, '/api/auth/me returns current authenticated beneficiary');
  const meData = await meRes.json();
  assert(meData.user.email === 'shwetha.s@livelihoodsaathi.org', '/api/auth/me returns correct email');

  // ---------------------------------------------------------------------------
  // 3. Multi-Tenant Data Isolation (Security Boundary)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Multi-Tenant Data Isolation ---');

  // 3.1 TNSRLM Admin attempts to read Aram Foundation profile
  const crossOrgRes = await fetch(`${BASE_URL}/api/organizations/org-aram`, {
    headers: { Authorization: `Bearer ${tnsrlmAdminToken}` },
  });
  assert(crossOrgRes.status === 403, 'Cross-tenant org access is blocked with HTTP 403 Forbidden');

  // 3.2 Beneficiary attempts to access admin endpoint /api/beneficiaries
  const benAdminRes = await fetch(`${BASE_URL}/api/beneficiaries`, {
    headers: { Authorization: `Bearer ${beneficiaryToken}` },
  });
  assert(benAdminRes.status === 403, 'Beneficiary cannot access administrative /api/beneficiaries (403)');

  // 3.3 TNSRLM Admin reads their own organization
  const ownOrgRes = await fetch(`${BASE_URL}/api/organizations/org-tnsrlm`, {
    headers: { Authorization: `Bearer ${tnsrlmAdminToken}` },
  });
  assert(ownOrgRes.status === 200, 'TNSRLM Admin successfully accesses own org profile');
  const ownOrgData = await ownOrgRes.json();
  assert(ownOrgData.organization.slug === 'tnsrlm', 'Correct organization data returned');

  // ---------------------------------------------------------------------------
  // 4. Beneficiary Management & Coordinator Caseload Filtering
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: Beneficiary Management ---');

  // 4.1 Register new rural youth beneficiary under TNSRLM
  const newBenRes = await fetch(`${BASE_URL}/api/beneficiaries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tnsrlmAdminToken}`,
    },
    body: JSON.stringify({
      name: 'Muthuvel Karuppasamy',
      email: `muthuvel.${Date.now()}@ruraltn.org`,
      phone: '+91 94421 99887',
      educationLevel: 'ITI Electrical (2025)',
      targetCareer: 'Solar PV Installation & Energy Auditing Lead',
      district: 'Madurai',
      location: 'Usilampatti, Madurai',
      employmentStatus: 'UNEMPLOYED',
      preferredLanguage: 'ta-IN',
      initialSkills: ['skill-2'],
    }),
  });
  assert(newBenRes.status === 201, 'Beneficiary registration under organization returns HTTP 201');
  const newBenData = await newBenRes.json();
  assert(Boolean(newBenData.beneficiary.beneficiaryCode), 'Beneficiary code automatically generated');
  createdBeneficiaryId = newBenData.beneficiary.id;

  // 4.2 Search beneficiaries by name
  const searchRes = await fetch(`${BASE_URL}/api/beneficiaries?q=Muthuvel`, {
    headers: { Authorization: `Bearer ${tnsrlmAdminToken}` },
  });
  assert(searchRes.status === 200, 'Search beneficiaries by name returns HTTP 200');
  const searchData = await searchRes.json();
  assert(searchData.beneficiaries.length >= 1, 'Search returned newly created beneficiary');

  // 4.3 Filter by district
  const districtRes = await fetch(`${BASE_URL}/api/beneficiaries?district=Madurai`, {
    headers: { Authorization: `Bearer ${tnsrlmAdminToken}` },
  });
  assert(districtRes.status === 200, 'Filter beneficiaries by district returns HTTP 200');
  const districtData = await districtRes.json();
  assert(districtData.beneficiaries.every((b) => b.district === 'Madurai'), 'All results belong to Madurai district');

  // 4.4 Get Beneficiary Details with full sub-records
  const benDetailRes = await fetch(`${BASE_URL}/api/beneficiaries/${createdBeneficiaryId}`, {
    headers: { Authorization: `Bearer ${tnsrlmAdminToken}` },
  });
  assert(benDetailRes.status === 200, 'Get beneficiary details returns HTTP 200');
  const benDetailData = await benDetailRes.json();
  assert(benDetailData.beneficiary.skills.length >= 1, 'Beneficiary skills list populated');
  assert(benDetailData.beneficiary.progressTimeline.length >= 1, 'Registration progress milestone recorded');

  // ---------------------------------------------------------------------------
  // 5. AI Skill & Career Assessment (Scikit-Learn + Gnani Evon)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 5: AI Assessment (Scikit-Learn + Evon Reasoning) ---');

  const assessRes = await fetch(`${BASE_URL}/api/assessments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${coordinatorToken}`,
    },
    body: JSON.stringify({
      beneficiaryId: createdBeneficiaryId,
      education: 'ITI Electrical',
      skills: ['Basic Electrical', 'Wiring'],
      interests: ['Solar Energy', 'Rooftop Panels', 'Renewable Power'],
      targetCareer: 'Solar PV Installation & Energy Auditing Lead',
      language: 'ta-IN',
    }),
  });
  assert(assessRes.status === 201, 'Submit assessment returns HTTP 201');
  const assessData = await assessRes.json();
  assert(
    assessData.assessment.dominantDomain.includes('Energy') || assessData.assessment.dominantDomain.includes('Green'),
    `Dominant domain computed accurately as energy/green sector (${assessData.assessment.dominantDomain})`
  );
  assert(assessData.assessment.matchedCareers.length > 0, 'Matched careers list generated by Scikit-Learn');
  assert(assessData.assessment.skillGaps.length > 0, 'Identified skill gaps generated');
  assert(Boolean(assessData.assessment.evonGuidance), 'Gnani Evon reasoning guidance generated');
  assert(Boolean(assessData.assessment.recommendationEngine), 'Recommendation engine reported');

  // 5.2 Direct Recommendation Endpoint /api/assessments/recommend
  const directRecRes = await fetch(`${BASE_URL}/api/assessments/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      education: 'B.Tech Computer Science',
      skills: ['Python', 'SQL'],
      interests: ['AI', 'Data Analysis', 'Web Apps'],
      targetCareer: 'Full-Stack Developer & AI Specialist',
      language: 'en-IN',
    }),
  });
  assert(directRecRes.status === 200, 'Direct recommendation endpoint returns HTTP 200');
  const directRecData = await directRecRes.json();
  assert(
    directRecData.dominantDomain.includes('Tech') || directRecData.dominantDomain.includes('Information'),
    `Tech/Information domain recognized for software query (${directRecData.dominantDomain})`
  );

  // ---------------------------------------------------------------------------
  // 6. Training Programme & Capacity Management
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 6: Training Programmes & Enrollment ---');

  // 6.1 Create new training programme
  const progRes = await fetch(`${BASE_URL}/api/training/programmes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tnsrlmAdminToken}`,
    },
    body: JSON.stringify({
      title: 'Advanced Solar Micro-Grid Engineering',
      titleTa: 'மேம்பட்ட சோலார் மைக்ரோ-கிரிட் பொறியியல் பயிற்சி',
      description: 'Advanced 8-week certification on hybrid micro-grids, commercial inverters, and net-metering.',
      sector: 'Green Skills',
      skillsTaught: ['Solar PV Installation & Maintenance', 'Grid Synchronization', 'Net Metering Protocols'],
      eligibility: 'ITI or Diploma in Electrical',
      durationWeeks: 8,
      startDate: '2026-12-01',
      endDate: '2027-01-25',
      totalSeats: 25,
    }),
  });
  assert(progRes.status === 201, 'Training programme created with HTTP 201');
  const progData = await progRes.json();
  createdProgrammeId = progData.programme.id;
  assert(progData.programme.availableSeats === 25, 'Initial available seats equal 25');

  // 6.2 Enroll beneficiary into programme
  const enrollRes = await fetch(`${BASE_URL}/api/training/enrollments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${coordinatorToken}`,
    },
    body: JSON.stringify({
      programmeId: createdProgrammeId,
      beneficiaryId: createdBeneficiaryId,
      status: 'ENROLLED',
    }),
  });
  assert(enrollRes.status === 201, 'Beneficiary enrolled with HTTP 201');
  const enrollData = await enrollRes.json();
  createdEnrollmentId = enrollData.enrollment.id;

  // 6.3 Verify programme seat decremented
  const progCheckRes = await fetch(`${BASE_URL}/api/training/programmes/${createdProgrammeId}`, {
    headers: { Authorization: `Bearer ${tnsrlmAdminToken}` },
  });
  const progCheckData = await progCheckRes.json();
  assert(progCheckData.programme.available_seats === 24, 'Available seats decremented to 24 after enrollment');

  // 6.4 Update enrollment status to COMPLETED
  const updateEnrollRes = await fetch(`${BASE_URL}/api/training/enrollments/${createdEnrollmentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${coordinatorToken}`,
    },
    body: JSON.stringify({
      status: 'COMPLETED',
      attendancePct: 96.0,
      gradeOrRemarks: 'Grade A - Certified Solar Lead',
    }),
  });
  assert(updateEnrollRes.status === 200, 'Enrollment marked as COMPLETED returns HTTP 200');

  // ---------------------------------------------------------------------------
  // 7. Structured Beneficiary Progress & Follow-up History
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 7: Progress & Follow-Up Tracking ---');

  // 7.1 Record milestone progress
  const milestoneRes = await fetch(`${BASE_URL}/api/beneficiaries/${createdBeneficiaryId}/progress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${coordinatorToken}`,
    },
    body: JSON.stringify({
      milestoneTitle: 'Placed in Local Rooftop Solar EPC Firm',
      milestoneType: 'EMPLOYMENT',
      notes: 'Placed as Junior Site Technician with monthly stipend and performance bonus.',
    }),
  });
  assert(milestoneRes.status === 201, 'Progress milestone recorded with HTTP 201');

  // 7.2 Log coordinator follow-up
  const fuRes = await fetch(`${BASE_URL}/api/beneficiaries/${createdBeneficiaryId}/follow-ups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${coordinatorToken}`,
    },
    body: JSON.stringify({
      channel: 'PHONE',
      notes: 'Checked on 1st week employment experience. Candidate reported safe working conditions and supportive site engineer.',
      nextActionDate: '2026-12-15',
      status: 'COMPLETED',
    }),
  });
  assert(fuRes.status === 201, 'Coordinator follow-up logged with HTTP 201');

  // ---------------------------------------------------------------------------
  // 8. Enterprise Analytics (Live Database Calculations)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 8: Enterprise Analytics (Live DB) ---');

  const analyticsRes = await fetch(`${BASE_URL}/api/analytics/dashboard`, {
    headers: { Authorization: `Bearer ${tnsrlmAdminToken}` },
  });
  assert(analyticsRes.status === 200, '/api/analytics/dashboard returns HTTP 200');
  const analyticsData = await analyticsRes.json();
  assert(analyticsData.metrics.beneficiaries.total >= 4, 'Real beneficiary count calculated from DB');
  assert(analyticsData.metrics.training.totalProgrammes >= 4, 'Real training programmes count calculated');
  assert(analyticsData.metrics.skillCategoryDistribution.length > 0, 'Real skill distribution calculated');
  assert(analyticsData.metrics.recentMilestones.length > 0, 'Recent milestones retrieved from DB timeline');

  // ---------------------------------------------------------------------------
  // 9. Preserved REST STT, TTS, and Guidance APIs
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 9: Voice & AI REST APIs ---');

  // 9.1 REST STT Transcribe
  const dummyBlob = new Blob([new Uint8Array(1024)], { type: 'audio/wav' });
  const sttForm = new FormData();
  sttForm.append('audio', dummyBlob, 'test.wav');
  sttForm.append('language', 'ta-IN');

  const sttRes = await fetch(`${BASE_URL}/api/stt/transcribe`, {
    method: 'POST',
    body: sttForm,
  });
  assert(sttRes.status === 200, 'REST STT /api/stt/transcribe returns HTTP 200');
  const sttData = await sttRes.json();
  assert(Boolean(sttData.text), 'STT returns transcribed text');

  // 9.2 REST TTS Synthesize
  const ttsRes = await fetch(`${BASE_URL}/api/tts/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'வணக்கம், உங்கள் தொழில் வழிகாட்டுதல் தயார்.', language: 'ta-IN' }),
  });
  assert(ttsRes.status === 200, 'REST TTS /api/tts/synthesize returns HTTP 200');
  const ttsData = await ttsRes.json();
  assert(Boolean(ttsData.mode), 'TTS returns synthesis mode instruction');

  // 9.3 AI Guidance Route
  const guideRes = await fetch(`${BASE_URL}/api/ai/guidance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'நான் சோலார் டெக்னீஷியன் வேலை வாய்ப்புகளை பற்றி அறிய விரும்புகிறேன்',
      language: 'ta-IN',
    }),
  });
  assert(guideRes.status === 200, '/api/ai/guidance returns HTTP 200');
  const guideData = await guideRes.json();
  assert(guideData.recommendations.detectedIntent === 'Green Skills', 'Intent accurately matched to Green Skills');
  assert(Boolean(guideData.recommendation_engine), 'Scikit-learn recommender engine integrated');
  assert(Boolean(guideData.ai_provider), 'Gnani Evon reasoning model integrated');

  console.log('\n================================================================');
  console.log(`🎉 ALL TESTS COMPLETED: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ Test Suite encountered fatal error:', err);
  process.exit(1);
});
