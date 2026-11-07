export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, language = 'ta-IN' } = await req.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    const gnaniApiKey = process.env.GNANI_API_KEY;
    const gnaniToken = process.env.GNANI_TOKEN;

    if (gnaniApiKey && gnaniToken) {
      try {
        const response = await fetch('https://api.vachana.ai/tts/v2/synthesize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': gnaniApiKey,
            Authorization: `Bearer ${gnaniToken}`,
          },
          body: JSON.stringify({
            text,
            language,
            audio_format: 'wav',
          }),
        });

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer();
          return new Response(audioBuffer, {
            headers: {
              'Content-Type': 'audio/wav',
              'Cache-Control': 'no-cache',
            },
          });
        }
      } catch (externalErr) {
        console.warn('Gnani TTS call failed, falling back to Web Speech response', externalErr);
      }
    }

    // Return metadata instructing the client to synthesize locally via Web Speech API
    return NextResponse.json({
      success: true,
      mode: 'web_speech',
      language,
      message: 'Client-side speech synthesis available for requested language',
    });
  } catch (error) {
    console.error('TTS Synthesize Error:', error);
    return NextResponse.json({ error: 'Failed to synthesize speech' }, { status: 500 });
  }
}
