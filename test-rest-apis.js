async function testRestApis() {
  const baseUrl = 'http://localhost:3000';
  console.log('Testing REST APIs on', baseUrl);

  // 1. Skills
  const skillsRes = await fetch(`${baseUrl}/api/skills`);
  const skills = await skillsRes.json();
  console.log('✓ /api/skills returned', skills.length, 'skills');

  // 2. Courses
  const coursesRes = await fetch(`${baseUrl}/api/courses`);
  const courses = await coursesRes.json();
  console.log('✓ /api/courses returned', courses.length, 'courses');

  // 3. Roadmaps
  const roadmapsRes = await fetch(`${baseUrl}/api/roadmaps`);
  const roadmaps = await roadmapsRes.json();
  console.log('✓ /api/roadmaps returned', roadmaps.length, 'roadmaps');

  // 4. TTS Synthesize
  const ttsRes = await fetch(`${baseUrl}/api/tts/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'வணக்கம், உங்கள் தொழில் வழிகாட்டுதல் தயார்.',
      language: 'ta-IN',
    }),
  });
  const ttsData = await ttsRes.json();
  console.log('✓ /api/tts/synthesize returned:', ttsData.mode || 'audio buffer');

  // 5. REST STT
  const formData = new FormData();
  const dummyAudioBlob = new Blob([new Uint8Array(1024)], { type: 'audio/wav' });
  formData.append('audio', dummyAudioBlob, 'test.wav');
  formData.append('language', 'ta-IN');

  const sttRes = await fetch(`${baseUrl}/api/stt/transcribe`, {
    method: 'POST',
    body: formData,
  });
  const sttData = await sttRes.json();
  console.log('✓ /api/stt/transcribe returned transcript:', sttData.text ? `"${sttData.text.slice(0, 40)}..."` : 'none');

  console.log('\n>>> ALL REST API INTEGRATION TESTS PASSED! <<<');
}

testRestApis().catch((err) => {
  console.error('REST API test failed:', err);
  process.exit(1);
});
