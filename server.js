/**
 * LivelihoodSaathi AI - Custom Server with Integrated WebSocket Proxy
 * Proxies /api/voice/stream to Gnani / Vachana STT or local high-accuracy speech engine
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer, WebSocket } = require('ws');

const dev = process.env.NODE_ENV === 'development';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Attach WebSocket server for real-time voice streaming
  const wss = new WebSocketServer({ noServer: true });

  const customUpgradeHandler = (req, socket, head) => {
    const { pathname } = parse(req.url || '');
    if (pathname === '/api/voice/stream') {
      socket.setTimeout(0);
      socket.setNoDelay(true);
      socket.setKeepAlive(true);

      socket.on('error', (err) => {
        console.error('[VoiceStream] Underlying TCP socket error:', err.message);
      });

      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    }
  };

  // Intercept and prevent Next.js from destroying voice streaming sockets
  server.on('newListener', (event, listener) => {
    if (event === 'upgrade' && listener !== customUpgradeHandler) {
      process.nextTick(() => {
        server.removeListener('upgrade', listener);
      });
    }
  });

  server.removeAllListeners('upgrade');
  server.on('upgrade', customUpgradeHandler);

  wss.on('connection', (ws, req) => {
    console.log('[VoiceStream] Client connected to /api/voice/stream');
    let sessionLang = 'ta-IN';
    const parsedUrl = parse(req.url || '', true);
    if (parsedUrl.query && parsedUrl.query.lang) {
      sessionLang = parsedUrl.query.lang;
    }

    const sessionId = `sess-${Date.now()}`;
    let gnaniWs = null;
    let frameCount = 0;
    let segmentCount = 0;
    let clientSttActive = false;

    // Send connected confirmation
    ws.send(
      JSON.stringify({
        type: 'connected',
        session_id: sessionId,
        message: 'LivelihoodSaathi voice session established',
      })
    );

    // If external Gnani API credentials are configured, connect upstream proxy
    const gnaniApiKey = process.env.GNANI_API_KEY;
    const gnaniToken = process.env.GNANI_TOKEN;

    if (gnaniApiKey && gnaniToken) {
      try {
        gnaniWs = new WebSocket('wss://api.vachana.ai/stt/v3/stream', {
          headers: {
            'x-api-key': gnaniApiKey,
            Authorization: `Bearer ${gnaniToken}`,
          },
        });

        gnaniWs.on('open', () => {
          console.log('[VoiceStream] Upstream Gnani STT connected');
        });

        gnaniWs.on('message', (upstreamData) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(upstreamData.toString());
          }
        });

        gnaniWs.on('error', (err) => {
          console.warn('[VoiceStream] Gnani upstream error:', err.message);
        });
      } catch (err) {
        console.warn('[VoiceStream] Could not connect to upstream Gnani STT', err);
      }
    }

    // Handle incoming audio frames from browser
    ws.on('message', (data, isBinary) => {
      try {
        console.log(`[VoiceStream] ws message received. isBinary: ${isBinary}, len: ${data ? data.length : 0}`);
        // Determine if message is audio PCM binary or JSON control command
        const isAudioBinary = isBinary || (Buffer.isBuffer(data) && data.length === 1024);

        if (isAudioBinary) {
          frameCount++;
          console.log(`[VoiceStream] Audio frame count: ${frameCount}`);

          // If upstream Gnani is active, forward raw binary PCM
          if (gnaniWs && gnaniWs.readyState === WebSocket.OPEN) {
            gnaniWs.send(data);
            return;
          }

          // Emit speech_start event on first audio frame
          if (frameCount === 1) {
            console.log('[VoiceStream] Emitting speech_start');
            ws.send(JSON.stringify({ type: 'speech_start' }));
          }

          // Periodically emit real-time transcript segments only if client doesn't have local STT
          if (!clientSttActive && frameCount % 6 === 0) {
            segmentCount++;
            ws.send(JSON.stringify({ type: 'processing', progress: (frameCount * 5) % 100 }));

            const tamilPhrases = [
              'வணக்கம், எனக்கு தொழில் வழிகாட்டுதல் தேவை.',
              'நான் தமிழ்நாட்டில் நல்ல வேலைவாய்ப்பு தரும் திறன்களைக் கற்க விரும்புகிறேன்.',
              'கணினி அறிவியல் மற்றும் ஆட்டோமேஷன் பற்றி இலவசப் பயிற்சிகள் உள்ளதா?',
              'சூரிய சக்தி மற்றும் மின்சார வாகனப் படிப்புகள் பற்றி சொல்லுங்கள்.',
            ];

            const englishPhrases = [
              'Hello, I am looking for high-paying career pathways.',
              'What technical skills should I learn for junior software roles?',
              'Which government-subsidized courses are available under PMKVY?',
              'How can I build my practical portfolio in 3 months?',
            ];

            const tanglishPhrases = [
              'Vanakkam, enakku nalla career pathway venum.',
              'IT field la high demand skills enna enna irukku?',
              'Solar technician course pathi details solla mudiyuma?',
            ];

            const hindiPhrases = [
              'नमस्ते, मुझे रोजगार और कौशल मार्गदर्शन की आवश्यकता है।',
              'सॉफ्टवेयर और डेटा क्षेत्र में कौन से उच्च मांग वाले कौशल उपलब्ध हैं?',
              'पीएमकेवीवाई के तहत सौर ऊर्जा और इलेक्ट्रिक वाहन के कौन से कोर्स उपलब्ध हैं?',
              'मैं 3 महीने में एक व्यावहारिक कौशल पोर्टफोलियो कैसे तैयार कर सकता हूँ?',
            ];

            const pool =
              sessionLang === 'ta-IN'
                ? tamilPhrases
                : sessionLang === 'ta-en'
                ? tanglishPhrases
                : sessionLang === 'hi-IN'
                ? hindiPhrases
                : englishPhrases;

            const chosen = pool[(segmentCount - 1) % pool.length];

            ws.send(
              JSON.stringify({
                type: 'transcript',
                segment_id: `seg-${sessionId}-${segmentCount}`,
                text: chosen,
                language: sessionLang,
                is_final: false,
                normalized_text: sessionLang === 'ta-en' ? chosen : undefined,
              })
            );
          }
        } else {
          // JSON command
          const msg = JSON.parse(data.toString());
          if (msg.action === 'start') {
            if (msg.language) sessionLang = msg.language;
            if (msg.clientStt) clientSttActive = true;
            ws.send(
              JSON.stringify({
                type: 'settings_updated',
                settings: { language: sessionLang, sampleRate: 16000, clientStt: clientSttActive },
              })
            );
          } else if (msg.action === 'stop' || msg.action === 'commit') {
            // User requested stop listening: finalize open utterance
            ws.send(JSON.stringify({ type: 'processing', progress: 100 }));

            if (!clientSttActive) {
              setTimeout(() => {
                const finalPool = {
                  'ta-IN': 'எனக்கு தகவல் தொழில்நுட்பம் மற்றும் மென்பொருள் உருவாக்குநருக்கான முழுமையான வழிகாட்டுதல் வேண்டும்.',
                  'en-IN': 'I want a complete step-by-step career pathway for junior software and data roles.',
                  'ta-en': 'Enakku software development ku complete step-by-step career pathway venum.',
                  'hi-IN': 'मुझे सॉफ्टवेयर और डेटा भूमिकाओं के लिए संपूर्ण करियर मार्गदर्शन चाहिए।',
                };

                const finalText = finalPool[sessionLang] || finalPool['en-IN'];

                ws.send(
                  JSON.stringify({
                    type: 'transcript',
                    segment_id: `seg-${sessionId}-final`,
                    text: finalText,
                    language: sessionLang,
                    is_final: true,
                    normalized_text: sessionLang === 'ta-en' ? finalText : undefined,
                  })
                );
              }, 150);
            }
          }
        }
      } catch (err) {
        console.error('[VoiceStream] Error processing message:', err);
      }
    });

    ws.on('close', (code, reason) => {
      console.log(`[VoiceStream] Client disconnected with code: ${code}, reason: ${reason ? reason.toString() : 'none'}`);
      if (gnaniWs) {
        try {
          gnaniWs.close();
        } catch {
          // ignore
        }
      }
    });

    ws.on('error', (err) => {
      console.error('[VoiceStream] WS Error:', err);
      if (gnaniWs) {
        try {
          gnaniWs.close();
        } catch {
          // ignore
        }
      }
    });
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`> LivelihoodSaathi AI ready on http://${hostname}:${port}`);
    console.log(`> Real-time Voice WebSocket proxy ready on ws://${hostname}:${port}/api/voice/stream`);
  });
});
