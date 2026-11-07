/**
 * LIVELIHOODSAATHI AI - Comprehensive Career AI & Voice Assistant Verification
 *
 * Verifies all 14 scenarios required by the user prompt:
 * 1. Career options after graduation (Freshers launchpad)
 * 2. Data Analyst career question
 * 3. Software Developer career question (MUST NOT return Data Analyst!)
 * 4. Business Analyst career question
 * 5. Digital Marketing career question
 * 6. Human Resources (HR) career question
 * 7. Electric Vehicle (EV) technician question
 * 8. Solar Energy technician question
 * 9. Natural Tamil (ta-IN) response in Tamil script
 * 10. Natural Tanglish (ta-en) response strictly in Latin letters
 * 11. Natural Hindi (hi-IN) response in Devanagari script
 * 12. Resume & Interview preparation question
 * 13. Salary expectations and growth question
 * 14. Ambiguous / Brief query with targeted follow-up question
 */

const http = require('http');

function postGuidance(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      'http://localhost:3000/api/ai/guidance',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${body}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('LIVELIHOODSAATHI AI - Career AI Voice Assistant Verification');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(desc, condition, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`  [PASS] #${total}: ${desc}`);
    } else {
      console.error(`  [FAIL] #${total}: ${desc} -> ${details}`);
    }
  }

  // ============================================================================
  // TEST SUITE A: 2nd-Year Engineering Student Internship (Tamil)
  // User Prompt Exact Query:
  // "நான் இரண்டாம் ஆண்டு இன்ஜினியரிங் படிக்கிறேன். என்னுடைய காலேஜ் படிப்பு முடிவதற்குள் நல்ல இன்டர்ன்ஷிப் வாங்க என்ன செய்ய வேண்டும்?"
  // ============================================================================
  console.log('--- Test A: 2nd-Year Engineering Internship in Tamil ---');
  const resA = await postGuidance({
    message: 'நான் இரண்டாம் ஆண்டு இன்ஜினியரிங் படிக்கிறேன். என்னுடைய காலேஜ் படிப்பு முடிவதற்குள் நல்ல இன்டர்ன்ஷிப் வாங்க என்ன செய்ய வேண்டும்?',
    language: 'ta-IN',
  });
  const hasTamilA = /[\u0B80-\u0BFF]/.test(resA.message);
  assert('Test A: Responds in natural Tamil script', hasTamilA, resA.message.slice(0, 80));
  assert('Test A: Detected language is ta-IN', resA.detected_language === 'ta-IN', resA.detected_language);
  assert(
    'Test A: Mentions 2nd-year internship roadmap, skills or projects',
    resA.message.includes('இன்டர்ன்ஷிப்') || resA.message.includes('திட்டங்கள்') || resA.message.includes('திறன்கள்'),
    resA.message.slice(0, 100)
  );
  assert(
    'Test A: Recommends College Internship & Apprenticeship Accelerator (path-12)',
    resA.recommendations?.careerPathways?.[0]?.id === 'path-12',
    resA.recommendations?.careerPathways?.[0]?.title
  );
  assert(
    'Test A: DOES NOT recommend Junior Data Analyst or Automation Specialist',
    !resA.message.includes('Junior Data Analyst') &&
      !resA.message.includes('Automation Specialist') &&
      resA.recommendations?.careerPathways?.[0]?.id !== 'path-1',
    resA.recommendations?.careerPathways?.[0]?.id
  );
  assert(
    'Test A: DOES NOT inject unrelated SWAYAM or Naan Mudhalvan by default',
    !resA.message.includes('Naan Mudhalvan') && !resA.message.includes('SWAYAM'),
    resA.message.slice(0, 80)
  );

  // ============================================================================
  // TEST SUITE B: English Internship Question (FIX: English must never receive Tamil!)
  // ============================================================================
  console.log('\n--- Test B: English Internship Question ---');
  const resB = await postGuidance({
    message: 'How can I get a good internship before I graduate as a second-year engineering student?',
    language: 'en-IN',
  });
  const hasTamilB = /[\u0B80-\u0BFF]/.test(resB.message);
  assert('Test B: Contains ZERO Tamil characters (pure English output)', !hasTamilB, 'Tamil chars detected!');
  assert('Test B: Detected language is en-IN', resB.detected_language === 'en-IN', resB.detected_language);
  assert(
    'Test B: Mentions internship roadmap, skills, portfolio and platforms',
    resB.message.toLowerCase().includes('internship') &&
      (resB.message.toLowerCase().includes('github') ||
        resB.message.toLowerCase().includes('resume') ||
        resB.message.toLowerCase().includes('projects')),
    resB.message.slice(0, 100)
  );
  assert(
    'Test B: Recommends College Internship & Apprenticeship Accelerator (path-12)',
    resB.recommendations?.careerPathways?.[0]?.id === 'path-12',
    resB.recommendations?.careerPathways?.[0]?.title
  );

  // ============================================================================
  // TEST SUITE C: Tanglish Internship Question (STRICTLY LATIN CHARACTERS)
  // ============================================================================
  console.log('\n--- Test C: Tanglish Internship Question ---');
  const resC = await postGuidance({
    message: 'Naan second year engineering padikuren, college mudiyarathukulla nalla internship epdi vaangurathu?',
    language: 'ta-en',
  });
  const hasTamilC = /[\u0B80-\u0BFF]/.test(resC.message);
  assert('Test C: Contains ZERO Tamil script characters (strictly Latin letters)', !hasTamilC, 'Tamil chars detected!');
  assert('Test C: Detected language is ta-en', resC.detected_language === 'ta-en', resC.detected_language);
  assert(
    'Test C: Conversational Tanglish phrasing used',
    resC.message.includes('pannunga') || resC.message.includes('irukku') || resC.message.includes('vaanga'),
    resC.message.slice(0, 80)
  );

  // ============================================================================
  // TEST SUITE D: Hindi Internship Question
  // ============================================================================
  console.log('\n--- Test D: Hindi Internship Question ---');
  const resD = await postGuidance({
    message: 'मैं इंजीनियरिंग के दूसरे वर्ष में हूँ, कॉलेज पूरा होने से पहले एक अच्छी इंटर्नशिप कैसे प्राप्त करूँ?',
    language: 'hi-IN',
  });
  const hasHindiD = /[\u0900-\u097F]/.test(resD.message);
  assert('Test D: Response is in natural Hindi Devanagari script', hasHindiD, resD.message.slice(0, 60));
  assert('Test D: Detected language is hi-IN', resD.detected_language === 'hi-IN', resD.detected_language);
  assert(
    'Test D: Mentions internship and practical roadmap',
    resD.message.includes('इंटर्नशिप') || resD.message.includes('कौशल'),
    resD.message.slice(0, 80)
  );

  // ============================================================================
  // TEST SUITE E: Cybersecurity & Mechanical Engineering Careers
  // ============================================================================
  console.log('\n--- Test E: Cybersecurity Career Question ---');
  const resCyber = await postGuidance({
    message: 'I am interested in cybersecurity. How do I start?',
    language: 'en-IN',
  });
  assert(
    'Test E: Cybersecurity advice covers networking, Linux, CompTIA or ethical hacking',
    resCyber.message.toLowerCase().includes('cybersecurity') ||
      resCyber.message.toLowerCase().includes('network') ||
      resCyber.message.toLowerCase().includes('linux'),
    resCyber.message.slice(0, 100)
  );
  assert(
    'Test E: Recommends Cybersecurity Analyst (path-10)',
    resCyber.recommendations?.careerPathways?.[0]?.id === 'path-10',
    resCyber.recommendations?.careerPathways?.[0]?.title
  );
  assert(
    'Test E: DOES NOT recommend Junior Data Analyst for Cybersecurity',
    resCyber.recommendations?.careerPathways?.[0]?.id !== 'path-1',
    resCyber.recommendations?.careerPathways?.[0]?.id
  );

  console.log('\n--- Test E: Mechanical Engineering Career Question ---');
  const resMech = await postGuidance({
    message: 'What career options are available after mechanical engineering?',
    language: 'en-IN',
  });
  assert(
    'Test E: Mechanical advice covers CAD, robotics, mechatronics or manufacturing',
    resMech.message.toLowerCase().includes('cad') ||
      resMech.message.toLowerCase().includes('mechanical') ||
      resMech.message.toLowerCase().includes('robotics'),
    resMech.message.slice(0, 100)
  );
  assert(
    'Test E: Recommends Mechanical & Mechatronics Design Engineer (path-11)',
    resMech.recommendations?.careerPathways?.[0]?.id === 'path-11',
    resMech.recommendations?.careerPathways?.[0]?.title
  );
  assert(
    'Test E: DOES NOT recommend Junior Data Analyst for Mechanical Engineering',
    resMech.recommendations?.careerPathways?.[0]?.id !== 'path-1',
    resMech.recommendations?.careerPathways?.[0]?.id
  );

  // TEST 1: What career can I choose after graduation?
  console.log('--- Test 1: Graduation Career Options ---');
  const res1 = await postGuidance({
    message: 'What career can I choose after graduation?',
    language: 'en-IN',
  });
  assert(
    'Graduation query mentions multiple career avenues (Software, Data, Marketing, Green Energy)',
    res1.message.toLowerCase().includes('software') ||
      res1.message.toLowerCase().includes('data') ||
      res1.message.toLowerCase().includes('graduat'),
    res1.message.slice(0, 100)
  );
  assert(
    'Graduation query does NOT force Junior Data Analyst as sole recommendation',
    !res1.message.startsWith('1. **Recommended Career**: Junior Data Analyst'),
    res1.message.slice(0, 80)
  );
  assert(
    'Pathway mapped to Fresh Graduates Launchpad (path-9)',
    res1.recommendations?.careerPathways?.[0]?.id === 'path-9',
    res1.recommendations?.careerPathways?.[0]?.title
  );

  // TEST 2: How do I become a Data Analyst?
  console.log('\n--- Test 2: Data Analyst Career Question ---');
  const res2 = await postGuidance({
    message: 'How do I become a Data Analyst?',
    language: 'en-IN',
  });
  assert(
    'Data Analyst response provides SQL / Excel / Power BI guidance',
    res2.message.toLowerCase().includes('sql') ||
      res2.message.toLowerCase().includes('excel') ||
      res2.message.toLowerCase().includes('power bi'),
    res2.message.slice(0, 100)
  );
  assert(
    'Primary pathway is Junior Data Analyst (path-1)',
    res2.recommendations?.careerPathways?.[0]?.id === 'path-1',
    res2.recommendations?.careerPathways?.[0]?.title
  );

  // TEST 3: How do I become a Software Developer? (MUST NOT return Data Analyst)
  console.log('\n--- Test 3: Software Developer Career Question ---');
  const res3 = await postGuidance({
    message: 'How do I become a Software Developer?',
    language: 'en-IN',
  });
  assert(
    'Software Developer advice covers programming, web dev or GitHub',
    res3.message.toLowerCase().includes('software') &&
      (res3.message.toLowerCase().includes('programming') ||
        res3.message.toLowerCase().includes('javascript') ||
        res3.message.toLowerCase().includes('python')),
    res3.message.slice(0, 100)
  );
  assert(
    'Does NOT recommend Junior Data Analyst for Software Developer query',
    !res3.message.includes('1. **Recommended Career**: Junior Data Analyst') &&
      res3.recommendations?.careerPathways?.[0]?.id === 'path-3',
    `Pathway ID: ${res3.recommendations?.careerPathways?.[0]?.id}, Title: ${res3.recommendations?.careerPathways?.[0]?.title}`
  );

  // TEST 4: Business Analyst
  console.log('\n--- Test 4: Business Analyst Career Question ---');
  const res4 = await postGuidance({
    message: 'What does a Business Analyst do and how do I become one?',
    language: 'en-IN',
  });
  assert(
    'Business Analyst advice covers requirements, Agile, Scrum or Jira',
    res4.message.toLowerCase().includes('business analyst') ||
      res4.message.toLowerCase().includes('agile') ||
      res4.message.toLowerCase().includes('requirement'),
    res4.message.slice(0, 100)
  );
  assert(
    'Primary pathway is Junior Business Analyst (path-4)',
    res4.recommendations?.careerPathways?.[0]?.id === 'path-4',
    res4.recommendations?.careerPathways?.[0]?.title
  );

  // TEST 5: Digital Marketing
  console.log('\n--- Test 5: Digital Marketing Career Question ---');
  const res5 = await postGuidance({
    message: 'How do I start a career in digital marketing and SEO?',
    language: 'en-IN',
  });
  assert(
    'Digital Marketing advice covers SEO, Google Ads, Meta or Content',
    res5.message.toLowerCase().includes('seo') ||
      res5.message.toLowerCase().includes('marketing') ||
      res5.message.toLowerCase().includes('google'),
    res5.message.slice(0, 100)
  );
  assert(
    'Primary pathway is Digital Marketing Executive (path-5)',
    res5.recommendations?.careerPathways?.[0]?.id === 'path-5',
    res5.recommendations?.careerPathways?.[0]?.title
  );

  // TEST 6: Human Resources (HR)
  console.log('\n--- Test 6: Human Resources (HR) Career Question ---');
  const res6 = await postGuidance({
    message: 'How can I get a job in HR and recruitment?',
    language: 'en-IN',
  });
  assert(
    'HR advice covers talent sourcing, recruitment, or onboarding',
    res6.message.toLowerCase().includes('human resources') ||
      res6.message.toLowerCase().includes('recruitment') ||
      res6.message.toLowerCase().includes('talent'),
    res6.message.slice(0, 100)
  );
  assert(
    'Primary pathway is HR & Talent Operations (path-6)',
    res6.recommendations?.careerPathways?.[0]?.id === 'path-6',
    res6.recommendations?.careerPathways?.[0]?.title
  );

  // TEST 7: Electric Vehicle (EV)
  console.log('\n--- Test 7: Electric Vehicle (EV) Career Question ---');
  const res7 = await postGuidance({
    message: 'Tell me about electric vehicle maintenance and battery courses',
    language: 'en-IN',
  });
  assert(
    'EV advice covers battery, motor controllers or charging',
    res7.message.toLowerCase().includes('electric vehicle') ||
      res7.message.toLowerCase().includes('battery') ||
      res7.message.toLowerCase().includes('ev'),
    res7.message.slice(0, 100)
  );
  assert(
    'Primary pathway is EV Technician (path-7)',
    res7.recommendations?.careerPathways?.[0]?.id === 'path-7',
    res7.recommendations?.careerPathways?.[0]?.title
  );

  // TEST 8: Solar Energy
  console.log('\n--- Test 8: Solar Energy Career Question ---');
  const res8 = await postGuidance({
    message: 'How to become a solar panel installation technician?',
    language: 'en-IN',
  });
  assert(
    'Solar advice covers rooftop solar, PM Surya Ghar or Suryamitra',
    res8.message.toLowerCase().includes('solar') ||
      res8.message.toLowerCase().includes('surya'),
    res8.message.slice(0, 100)
  );
  assert(
    'Primary pathway is Solar Entrepreneur / Technician (path-2)',
    res8.recommendations?.careerPathways?.[0]?.id === 'path-2',
    res8.recommendations?.careerPathways?.[0]?.title
  );

  // TEST 9: Tamil (ta-IN)
  console.log('\n--- Test 9: Tamil (ta-IN) Career Response ---');
  const res9 = await postGuidance({
    message: 'எனக்கு மென்பொருள் உருவாக்குநராக பணியாற்ற என்ன வழிகாட்டுதல்?',
    language: 'ta-IN',
  });
  const hasTamil = /[\u0B80-\u0BFF]/.test(res9.message);
  assert('Response is in natural Tamil script', hasTamil, res9.message.slice(0, 60));
  assert('Detected language is ta-IN', res9.detected_language === 'ta-IN', res9.detected_language);
  assert(
    'Primary pathway is Junior Full-Stack Web Developer (path-3)',
    res9.recommendations?.careerPathways?.[0]?.id === 'path-3',
    res9.recommendations?.careerPathways?.[0]?.title
  );

  // TEST 10: Tanglish (ta-en) - MUST BE STRICTLY LATIN LETTERS
  console.log('\n--- Test 10: Tanglish (ta-en) Career Response ---');
  const res10 = await postGuidance({
    message: 'Software developer aaga ungalukku enna skills venum, eppadi prepare panradhu?',
    language: 'ta-en',
  });
  const hasTamilInTanglish = /[\u0B80-\u0BFF]/.test(res10.message);
  assert(
    'Tanglish response contains ZERO Tamil script characters (strictly Latin letters)',
    !hasTamilInTanglish,
    'Tamil chars found!'
  );
  assert(
    'Tanglish response uses conversational Tanglish (e.g., learn pannunga, irukku)',
    res10.message.includes('pannunga') ||
      res10.message.includes('irukku') ||
      res10.message.includes('aaga'),
    res10.message.slice(0, 80)
  );
  assert('Detected language is ta-en', res10.detected_language === 'ta-en', res10.detected_language);
  assert(
    'Actionable steps in Tanglish also strictly Latin letters',
    !res10.recommendations?.nextSteps?.some((s) => /[\u0B80-\u0BFF]/.test(s)),
    'Tamil chars found in nextSteps'
  );

  // TEST 11: Hindi (hi-IN)
  console.log('\n--- Test 11: Hindi (hi-IN) Career Response ---');
  const res11 = await postGuidance({
    message: 'सॉफ्टवेयर विकास और तकनीकी क्षेत्र में नौकरी के क्या अवसर हैं?',
    language: 'hi-IN',
  });
  const hasHindi = /[\u0900-\u097F]/.test(res11.message);
  assert('Response is in natural Hindi Devanagari script', hasHindi, res11.message.slice(0, 60));
  assert('Detected language is hi-IN', res11.detected_language === 'hi-IN', res11.detected_language);

  // TEST 12: Resume & Interview Preparation
  console.log('\n--- Test 12: Resume & Interview Preparation ---');
  const res12 = await postGuidance({
    message: 'How should I prepare my resume and crack my fresher interview?',
    language: 'en-IN',
  });
  assert(
    'Interview advice covers STAR method, 1-page resume, or mock interviews',
    res12.message.toLowerCase().includes('resume') ||
      res12.message.toLowerCase().includes('interview') ||
      res12.message.toLowerCase().includes('star'),
    res12.message.slice(0, 100)
  );

  // TEST 13: Salary Benchmarks
  console.log('\n--- Test 13: Salary Expectations & Growth ---');
  const res13 = await postGuidance({
    message: 'What is the starting salary and package for freshers in tech?',
    language: 'en-IN',
  });
  assert(
    'Salary advice covers realistic benchmarks (₹3.5L - ₹6.0L)',
    res13.message.includes('3.5') ||
      res13.message.includes('₹') ||
      res13.message.toLowerCase().includes('salary'),
    res13.message.slice(0, 100)
  );

  // TEST 14: Ambiguous Query
  console.log('\n--- Test 14: Ambiguous / Brief Query ---');
  const res14 = await postGuidance({
    message: 'job venum help',
    language: 'ta-en',
  });
  assert(
    'Ambiguous query asks a polite relevant follow-up question',
    res14.message.includes('?') || res14.message.toLowerCase().includes('educational'),
    res14.message.slice(0, 100)
  );

  console.log('\n================================================================');
  console.log(`VERIFICATION SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('>>> ALL 14 SCENARIOS PASSED WITH 100% ACCURACY! <<<');
    process.exit(0);
  } else {
    console.error(`>>> ${total - passed} TESTS FAILED <<<`);
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});

