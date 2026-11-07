const { WebSocket } = require('ws');

async function testWebSocket() {
  console.log('Connecting to ws://127.0.0.1:3000/api/voice/stream?lang=ta-IN ...');

  return new Promise((resolve, reject) => {
    const ws = new WebSocket('ws://127.0.0.1:3000/api/voice/stream?lang=ta-IN');

    let connected = false;
    let receivedSpeechStart = false;
    let receivedTranscript = false;
    let receivedFinal = false;

    ws.on('open', () => {
      console.log('✓ WebSocket connected successfully!');
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        console.log('Received server event:', msg.type, msg.segment_id || '', msg.text ? `"${msg.text.slice(0, 35)}..."` : '');

        if (msg.type === 'connected') {
          connected = true;
          console.log('Streaming 16kHz PCM frames (1024 bytes per frame)...');
          let count = 0;
          const interval = setInterval(() => {
            count++;
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(Buffer.alloc(1024), { binary: true });
            }

            if (count >= 15) {
              clearInterval(interval);
              console.log('Sending stop / commit signal...');
              setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({ action: 'stop' }));
                }
              }, 100);
            }
          }, 40);
        }

        if (msg.type === 'speech_start') {
          receivedSpeechStart = true;
        }

        if (msg.type === 'transcript') {
          receivedTranscript = true;
          if (msg.is_final) {
            receivedFinal = true;
            console.log('✓ Received FINAL transcript segment:', msg.text);
            setTimeout(() => {
              ws.close(1000, 'Test completed');
            }, 200);
          }
        }
      } catch (e) {
        console.error('Error handling message:', e);
      }
    });

    ws.on('close', (code, reason) => {
      console.log('WebSocket closed with code:', code, reason ? reason.toString() : '');
      if (connected && receivedSpeechStart && receivedTranscript && receivedFinal) {
        console.log('\n>>> TEST PASSED: Full Realtime Speech-to-Text WebSocket Lifecycle Verified! <<<');
        resolve();
      } else {
        reject(new Error(`Test incomplete: connected=${connected}, speech_start=${receivedSpeechStart}, transcript=${receivedTranscript}, final=${receivedFinal}`));
      }
    });

    ws.on('error', (err) => {
      reject(err);
    });
  });
}

testWebSocket()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('WS test failed:', err.message);
    process.exit(1);
  });
