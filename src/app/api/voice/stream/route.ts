export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Returns instructions and status for WebSocket stream
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/voice/stream',
    protocol: 'WebSocket',
    instructions: 'Upgrade connection using ws:// or wss:// with binary PCM16 audio packets (16kHz, 512 samples/frame)',
    features: ['gnani_vachana_proxy', 'tamil_speech_stt', 'english_speech_stt', 'tanglish_support'],
  });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({
    message: 'For binary streaming, please connect via WebSocket to /api/voice/stream or use REST STT at /api/stt/transcribe',
  });
}
