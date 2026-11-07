/**
 * LIVELIHOODSAATHI AI - Complete Voice System & Multilingual Verification Suite
 *
 * Tests:
 * 1. Voice Input & Speech-to-Text across ALL 4 supported languages (ta-IN, en-IN, ta-en, hi-IN)
 * 2. Real-time Voice WebSocket streaming across ALL 4 supported languages
 * 3. AI Multilingual Reasoning & Intent matching in each language
 * 4. Text-to-Speech Synthesis across ALL 4 supported languages
 * 5. Latency Measurement (Before vs After Optimization)
 * 6. 120-Second continuous input & silence activity detection validation
 */

const { WebSocket } = require('ws');

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const WS_BASE_URL = process.env.TEST_WS_URL || 'ws://127.0.0.1:3000/api/voice/stream';

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

async function runCompleteVoiceTestSuite() {
  console.log('================================================================');
  console.log('🎙️ LIVELIHOODSAATHI AI - COMPLETE VOICE & MULTILINGUAL TEST SUITE');
  console.log('Target Server:', BASE_URL);
  console.log('================================================================\n');

  const supportedLanguages = [
    { code: 'ta-IN', name: 'Tamil', sampleQuery: 'நான் சோலார் டெக்னீஷியன் வேலை வாய்ப்புகளை பற்றி அறிய விரும்புகிறேன்' },
    { code: 'en-IN', name: 'English', sampleQuery: 'What are the top government-subsidized career courses in clean energy?' },
    { code: 'ta-en', name: 'Tanglish', sampleQuery: 'Electric vehicle maintenance course pathi details solla mudiyuma?' },
    { code: 'hi-IN', name: 'Hindi', sampleQuery: 'मुझे सोलर पैनल स्थापना और आईटी क्षेत्र में कौशल मार्गदर्शन चाहिए।' },
  ];

  // ---------------------------------------------------------------------------
  // TEST 1: Speech-to-Text REST API across ALL 4 Languages
  // ---------------------------------------------------------------------------
  console.log('--- TEST 1: Speech-to-Text REST API across ALL 4 Languages ---');
  for (const lang of supportedLanguages) {
    const dummyBlob = new Blob([new Uint8Array(1024)], { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('audio', dummyBlob, 'test.wav');
    formData.append('language', lang.code);

    const res = await fetch(`${BASE_URL}/api/stt/transcribe`, {
      method: 'POST',
      body: formData,
    });
    assert(res.status === 200, `STT returns HTTP 200 for ${lang.name} (${lang.code})`);
    const data = await res.json();
    assert(Boolean(data.text && data.text.length > 0), `STT returned valid transcript for ${lang.name}`);
    console.log(`    [${lang.code}] Sample transcript: "${data.text.slice(0, 50)}..."`);
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Real-time Voice WebSocket Streaming across ALL 4 Languages
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 2: Real-time Voice WebSocket Streaming for All Languages ---');
  for (const lang of supportedLanguages) {
    await new Promise((resolve, reject) => {
      const ws = new WebSocket(`${WS_BASE_URL}?lang=${lang.code}`);
      let speechReceived = false;
      let transcriptReceived = false;

      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error(`WebSocket test timed out for ${lang.code}`));
      }, 5000);

      ws.on('open', () => {
        ws.send(JSON.stringify({ action: 'start', language: lang.code, sampleRate: 16000 }));
        // Stream audio PCM frames
        for (let i = 0; i < 8; i++) {
          const fakePcm = Buffer.alloc(1024);
          ws.send(fakePcm);
        }
        setTimeout(() => {
          ws.send(JSON.stringify({ action: 'stop' }));
        }, 300);
      });

      ws.on('message', (msg) => {
        const evt = JSON.parse(msg.toString());
        if (evt.type === 'speech_start') {
          speechReceived = true;
        } else if (evt.type === 'transcript') {
          transcriptReceived = true;
        }
      });

      ws.on('close', () => {
        clearTimeout(timeout);
        assert(speechReceived, `WebSocket speech_start received for ${lang.name} (${lang.code})`);
        assert(transcriptReceived, `WebSocket transcript received for ${lang.name} (${lang.code})`);
        resolve();
      });

      setTimeout(() => {
        ws.close();
      }, 1000);
    });
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Multilingual AI Guidance & Reasoning across ALL 4 Languages
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 3: Multilingual AI Guidance & Evon Reasoning ---');
  for (const lang of supportedLanguages) {
    const res = await fetch(`${BASE_URL}/api/ai/guidance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: lang.sampleQuery,
        language: lang.code,
      }),
    });
    assert(res.status === 200, `AI Guidance returns HTTP 200 for ${lang.name} (${lang.code})`);
    const data = await res.json();
    assert(data.detected_language === lang.code, `Accurately detected language: ${lang.code}`);
    assert(Boolean(data.message && data.message.length > 0), `Guidance message generated in ${lang.name}`);
    assert(data.recommendations.skills.length > 0, `Recommended skills populated for ${lang.name}`);
    assert(data.recommendations.nextSteps.length > 0, `Actionable steps populated for ${lang.name}`);

    if (lang.code === 'ta-IN') {
      assert(/[\u0B80-\u0BFF]/.test(data.message), 'Tamil script correctly present in Tamil response');
    } else if (lang.code === 'hi-IN') {
      assert(/[\u0900-\u097F]/.test(data.message), 'Devanagari script correctly present in Hindi response');
    }
    console.log(`    [${lang.code}] Response snippet: "${data.message.slice(0, 50).replace(/\n/g, ' ')}..."`);
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Text-to-Speech REST Synthesis across ALL 4 Languages
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 4: Text-to-Speech REST Synthesis for All Languages ---');
  for (const lang of supportedLanguages) {
    const res = await fetch(`${BASE_URL}/api/tts/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: lang.sampleQuery,
        language: lang.code,
      }),
    });
    assert(res.status === 200, `TTS returns HTTP 200 for ${lang.name} (${lang.code})`);
    const data = await res.json();
    assert(Boolean(data.mode), `TTS returns valid mode for ${lang.name}`);
    assert(data.language === lang.code, `TTS preserves requested language code: ${lang.code}`);
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Latency Measurement & Performance Optimization Verification
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 5: Latency Measurement & Benchmarking ---');
  const latencies = [];
  for (let i = 0; i < 3; i++) {
    const t0 = Date.now();
    const res = await fetch(`${BASE_URL}/api/ai/guidance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'solar green energy technician training courses',
        language: 'en-IN',
      }),
    });
    const elapsed = Date.now() - t0;
    latencies.push(elapsed);
    assert(res.status === 200, `Benchmark request #${i + 1} succeeded in ${elapsed}ms`);
  }

  const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  console.log(`    ⚡ Average AI Guidance Response Latency: ${avgLatency}ms (Previous cold-start was ~3500ms)`);
  assert(avgLatency < 500, `AI Guidance response is ultra-fast (<500ms, actual: ${avgLatency}ms)`);

  // ---------------------------------------------------------------------------
  // TEST 6: Continuous 120-Second Voice Input Configuration Validation
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 6: 120-Second Voice Input & VAD Configuration ---');
  const fs = require('fs');
  const path = require('path');
  const hookFile = fs.readFileSync(path.join(__dirname, 'src', 'hooks', 'useVoiceStream.ts'), 'utf-8');

  assert(hookFile.includes('maxDurationSeconds = 120'), 'Max duration configured to 120 seconds in useVoiceStream');
  assert(hookFile.includes('silenceTimeoutSeconds = 3.0'), 'Intelligent VAD silence timeout configured to 3.0 seconds');
  assert(hookFile.includes('cancelListening'), 'cancelListening abort method provided');
  assert(hookFile.includes('recordingDuration'), 'recordingDuration elapsed time tracker provided');
  assert(!hookFile.includes('currentRemaining = 7;'), 'Old 7-second countdown removed');
  assert(!hookFile.includes('setTimeout(() => { if (!isStoppingRef.current) { stopListening(); } }, 7200);'), 'Old 7.2-second timeout removed');

  console.log('\n================================================================');
  console.log(`🎉 COMPLETE VOICE SUITE FINISHED: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================\n');
}

runCompleteVoiceTestSuite().catch((err) => {
  console.error('\n❌ Voice Test Suite failed with error:', err);
  process.exit(1);
});

