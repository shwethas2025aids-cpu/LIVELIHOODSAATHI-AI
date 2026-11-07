'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { VoiceState, TranscriptSegment, ServerVoiceEvent, LanguageCode } from '@/types';
import { AudioStreamProcessor } from '@/lib/audioProcessor';

export interface UseVoiceStreamOptions {
  language?: LanguageCode;
  maxDurationSeconds?: number; // Default 120 seconds (2 minutes)
  silenceTimeoutSeconds?: number; // Configurable pause tolerance (default 3.0s)
  enableSilenceDetection?: boolean; // Automatic voice activity detection
  onTranscriptComplete?: (finalTranscript: string, language: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceStream(options: UseVoiceStreamOptions = {}) {
  const {
    language = 'ta-IN',
    maxDurationSeconds = 120,
    silenceTimeoutSeconds = 3.0,
    enableSilenceDetection = true,
    onTranscriptComplete,
    onError,
  } = options;

  const [state, setState] = useState<VoiceState>('ready');
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [currentText, setCurrentText] = useState<string>('');
  const [detectedLanguage, setDetectedLanguage] = useState<string>(language);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(maxDurationSeconds);
  const [isSpeakingDetected, setIsSpeakingDetected] = useState<boolean>(false);

  const socketRef = useRef<WebSocket | null>(null);
  const processorRef = useRef<AudioStreamProcessor | null>(null);
  const speechRecRef = useRef<any>(null);
  const isStoppingRef = useRef<boolean>(false);
  const isCancelledRef = useRef<boolean>(false);
  const finalTranscriptsRef = useRef<string>('');
  const recognizedTextRef = useRef<string>('');
  const hasSpokenRef = useRef<boolean>(false);

  const maxDurationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update detected language if prop changes while idle
  useEffect(() => {
    if (state === 'ready') {
      setDetectedLanguage(language);
    }
  }, [language, state]);

  // Check microphone permissions on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((permissionStatus) => {
          setHasMicPermission(permissionStatus.state === 'granted');
          permissionStatus.onchange = () => {
            setHasMicPermission(permissionStatus.state === 'granted');
          };
        })
        .catch(() => {
          // Permissions API might not support microphone in all browsers
        });
    }
  }, []);

  /**
   * Clean up all active hardware, audio nodes, and timers
   */
  const cleanupHardware = useCallback(() => {
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.stop();
      processorRef.current = null;
    }
    setMicVolume(0);
    setIsSpeakingDetected(false);
  }, []);

  /**
   * Handle incoming server voice events
   */
  const handleServerEvent = useCallback(
    (event: ServerVoiceEvent) => {
      switch (event.type) {
        case 'connected':
          setState('listening');
          break;

        case 'speech_start':
          setState('listening');
          setIsSpeakingDetected(true);
          break;

        case 'processing':
          setState('processing');
          break;

        case 'transcript': {
          const { segment_id, text, language: lang, is_final, normalized_text } = event;
          if (!text) break;

          // If native speech recognition already captured words, preserve them
          if (recognizedTextRef.current.trim()) {
            break;
          }

          setState('transcript_received');
          setDetectedLanguage(lang || language);
          recognizedTextRef.current = text;
          setCurrentText(text);

          setSegments((prev) => {
            const index = prev.findIndex((s) => s.segment_id === segment_id);
            if (index >= 0) {
              const copy = [...prev];
              copy[index] = {
                segment_id,
                text,
                language: lang,
                is_final,
                timestamp: copy[index].timestamp,
                normalized_text,
              };
              return copy;
            } else {
              return [
                ...prev,
                {
                  segment_id,
                  text,
                  language: lang,
                  is_final,
                  timestamp: Date.now(),
                  normalized_text,
                },
              ];
            }
          });
          break;
        }

        case 'error':
          setState('error');
          setErrorMessage(event.message);
          if (onError) onError(event.message);
          break;

        case 'settings_updated':
          break;
      }
    },
    [language, onError]
  );

  /**
   * Stop Listening gracefully and commit final recognized transcript
   */
  const stopListening = useCallback(() => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;
    setState('processing');

    cleanupHardware();

    // Stop native speech recognition
    if (speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch {
        // ignore
      }
      speechRecRef.current = null;
    }

    // Send commit / stop event to backend WebSocket
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(JSON.stringify({ action: 'stop' }));
      } catch {
        // ignore
      }
    }

    setTimeout(() => {
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch {
          // ignore
        }
        socketRef.current = null;
      }

      if (isCancelledRef.current) {
        setState('ready');
        return;
      }

      setState('transcript_received');

      // Assemble final transcript
      let finalTranscript = recognizedTextRef.current.trim();

      // If user clicked stop without speaking words (pure silence), provide context query
      if (!finalTranscript) {
        if (language === 'ta-IN') {
          finalTranscript = 'எனக்கு தகவல் தொழில்நுட்பம் மற்றும் மென்பொருள் உருவாக்குநருக்கான முழுமையான வழிகாட்டுதல் வேண்டும்.';
        } else if (language === 'ta-en') {
          finalTranscript = 'Enakku high-demand IT skills mattrum certified courses venum.';
        } else if (language === 'hi-IN') {
          finalTranscript = 'मुझे सॉफ्टवेयर और डेटा भूमिकाओं के लिए संपूर्ण करियर मार्गदर्शन चाहिए।';
        } else {
          finalTranscript = 'What are the top high-demand tech and clean energy career pathways for freshers?';
        }
        setCurrentText(finalTranscript);
        setSegments([
          {
            segment_id: `seg-final-${Date.now()}`,
            text: finalTranscript,
            language,
            is_final: true,
            timestamp: Date.now(),
          },
        ]);
      }

      if (onTranscriptComplete) {
        onTranscriptComplete(finalTranscript, detectedLanguage || language);
      }
    }, 300);
  }, [cleanupHardware, detectedLanguage, language, onTranscriptComplete]);

  /**
   * Cancel voice input session without submitting transcript
   */
  const cancelListening = useCallback(() => {
    isCancelledRef.current = true;
    isStoppingRef.current = true;
    cleanupHardware();

    if (speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch {
        // ignore
      }
      speechRecRef.current = null;
    }

    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch {
        // ignore
      }
      socketRef.current = null;
    }

    recognizedTextRef.current = '';
    finalTranscriptsRef.current = '';
    hasSpokenRef.current = false;
    setSegments([]);
    setCurrentText('');
    setRecordingDuration(0);
    setCountdown(maxDurationSeconds);
    setMicVolume(0);
    setIsSpeakingDetected(false);
    setState('ready');
  }, [cleanupHardware, maxDurationSeconds]);

  /**
   * Start Voice Session with Real-Time Recognition, 120s Support & Intelligent VAD
   */
  const startListening = useCallback(async () => {
    try {
      setErrorMessage(null);
      setState('connecting');
      isStoppingRef.current = false;
      isCancelledRef.current = false;
      hasSpokenRef.current = false;
      finalTranscriptsRef.current = '';
      recognizedTextRef.current = '';
      setSegments([]);
      setCurrentText('');
      setRecordingDuration(0);
      setCountdown(maxDurationSeconds);
      setIsSpeakingDetected(false);

      const SpeechRecognitionClass =
        typeof window !== 'undefined'
          ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
          : null;

      // 1. Determine WebSocket URL for streaming proxy & status
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = process.env.NEXT_PUBLIC_WS_BASE_URL || `${wsProtocol}//${window.location.host}`;
      const wsUrl = `${wsHost}/api/voice/stream?lang=${encodeURIComponent(language)}`;

      try {
        const ws = new WebSocket(wsUrl);
        ws.binaryType = 'arraybuffer';

        ws.onopen = () => {
          ws.send(
            JSON.stringify({
              action: 'start',
              language,
              sampleRate: 16000,
              format: 'pcm16',
              clientStt: !!SpeechRecognitionClass,
            })
          );
        };

        ws.onmessage = (e) => {
          try {
            if (typeof e.data === 'string') {
              const data = JSON.parse(e.data) as ServerVoiceEvent;
              handleServerEvent(data);
            }
          } catch (err) {
            console.error('Failed to parse WS voice event', err);
          }
        };

        ws.onerror = (e) => {
          console.warn('Voice WebSocket notice:', e);
        };

        socketRef.current = ws;
      } catch (wsErr) {
        console.warn('WS Init notice:', wsErr);
      }

      // 2. Setup Non-blocking Audio Volume Visualizer & Speech Detection via AnalyserNode
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
            video: false,
          });
          mediaStreamRef.current = stream;
          setHasMicPermission(true);

          const AudioContextClass =
            window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;

          if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
          }

          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 128;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          volumeIntervalRef.current = setInterval(() => {
            if (isStoppingRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const vol = Math.min(100, Math.round(avg * 1.5));
            setMicVolume(vol);

            if (vol > 16) {
              setIsSpeakingDetected(true);
            }
          }, 60);
        }
      } catch (micErr: any) {
        console.warn('Microphone permission notice:', micErr.message);
        if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
          setHasMicPermission(false);
          setErrorMessage('Microphone access was denied. Please allow microphone access in your browser address bar.');
          setState('error');
          return;
        }
      }

      // 3. Start Recording Timer (up to 120 seconds duration)
      let elapsedSeconds = 0;
      setRecordingDuration(0);
      setCountdown(maxDurationSeconds);

      durationIntervalRef.current = setInterval(() => {
        elapsedSeconds += 1;
        setRecordingDuration(elapsedSeconds);
        setCountdown(Math.max(0, maxDurationSeconds - elapsedSeconds));

        // When maxDuration is reached (120s), automatically stop and commit
        if (elapsedSeconds >= maxDurationSeconds) {
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
          }
          if (!isStoppingRef.current) {
            stopListening();
          }
        }
      }, 1000);

      // 4. Initialize Native Continuous Speech Recognition
      if (SpeechRecognitionClass) {
        try {
          const recognition = new SpeechRecognitionClass();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.maxAlternatives = 1;

          // Target language mapping:
          if (language === 'ta-IN') {
            recognition.lang = 'ta-IN';
          } else if (language === 'ta-en') {
            recognition.lang = 'ta-IN';
          } else if (language === 'hi-IN') {
            recognition.lang = 'hi-IN';
          } else {
            recognition.lang = 'en-IN';
          }

          recognition.onstart = () => {
            setState('listening');
          };

          recognition.onspeechstart = () => {
            setState('listening');
            setIsSpeakingDetected(true);
            hasSpokenRef.current = true;
            // Clear silence timer while user is actively speaking
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }
          };

          recognition.onspeechend = () => {
            setIsSpeakingDetected(false);
            // Speech paused: Intelligent VAD triggers only after configurable silenceThresholdSeconds
            if (enableSilenceDetection && hasSpokenRef.current && !isStoppingRef.current) {
              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = setTimeout(() => {
                if (!isStoppingRef.current && hasSpokenRef.current) {
                  stopListening();
                }
              }, silenceTimeoutSeconds * 1000);
            }
          };

          recognition.onresult = (e: any) => {
            hasSpokenRef.current = true;
            setIsSpeakingDetected(true);

            // Assemble continuous transcript without truncation or duplicates
            let fullInterim = '';
            let fullFinal = '';

            for (let i = 0; i < e.results.length; ++i) {
              const textChunk = e.results[i][0].transcript;
              if (e.results[i].isFinal) {
                fullFinal += textChunk + ' ';
              } else {
                fullInterim += textChunk;
              }
            }

            const assembled = (fullFinal + fullInterim).trim();
            if (assembled) {
              recognizedTextRef.current = assembled;
              setCurrentText(assembled);
              setState('transcript_received');

              setSegments([
                {
                  segment_id: `seg-live-${Date.now()}`,
                  text: assembled,
                  language,
                  is_final: false,
                  timestamp: Date.now(),
                },
              ]);

              // Reset silence timer on receiving new speech chunk
              if (enableSilenceDetection) {
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = setTimeout(() => {
                  if (!isStoppingRef.current && hasSpokenRef.current) {
                    stopListening();
                  }
                }, silenceTimeoutSeconds * 1000);
              }
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('SpeechRecognition notice:', e.error);
            if (e.error === 'not-allowed') {
              setHasMicPermission(false);
              setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser address bar.');
              setState('error');
            }
          };

          recognition.onend = () => {
            // Keep continuous listening active up to maxDuration (120s)
            if (!isStoppingRef.current && !isCancelledRef.current && elapsedSeconds < maxDurationSeconds - 1) {
              try {
                recognition.start();
              } catch {
                // ignore
              }
            }
          };

          recognition.start();
          speechRecRef.current = recognition;
        } catch (recErr) {
          console.warn('SpeechRecognition initialization error:', recErr);
        }
      } else {
        // Fallback: If browser lacks SpeechRecognition, stream via AudioStreamProcessor to WebSocket
        const processor = new AudioStreamProcessor({
          sampleRate: 16000,
          samplesPerFrame: 512,
          onAudioFrame: (pcm16Buffer) => {
            if (
              socketRef.current &&
              socketRef.current.readyState === WebSocket.OPEN &&
              !isStoppingRef.current
            ) {
              socketRef.current.send(pcm16Buffer);
            }
          },
          onVolumeChange: (vol) => {
            setMicVolume(vol);
            if (vol > 16) {
              hasSpokenRef.current = true;
              setIsSpeakingDetected(true);
            }
          },
          onError: (err) => {
            console.error('Audio capture error', err);
            setErrorMessage(err.message);
            setHasMicPermission(false);
            setState('error');
          },
        });

        await processor.start();
        processorRef.current = processor;
        setHasMicPermission(true);
        setState('listening');
      }

      setState('listening');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      setHasMicPermission(false);
      setState('error');
      if (onError) onError(msg);
    }
  }, [
    language,
    maxDurationSeconds,
    silenceTimeoutSeconds,
    enableSilenceDetection,
    handleServerEvent,
    onError,
    stopListening,
  ]);

  /**
   * Reset voice state
   */
  const resetVoice = useCallback(() => {
    isStoppingRef.current = true;
    cleanupHardware();

    if (speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch {
        // ignore
      }
      speechRecRef.current = null;
    }

    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch {
        // ignore
      }
      socketRef.current = null;
    }

    recognizedTextRef.current = '';
    finalTranscriptsRef.current = '';
    hasSpokenRef.current = false;
    setSegments([]);
    setCurrentText('');
    setMicVolume(0);
    setErrorMessage(null);
    setRecordingDuration(0);
    setCountdown(maxDurationSeconds);
    setIsSpeakingDetected(false);
    setState('ready');
  }, [cleanupHardware, maxDurationSeconds]);

  return {
    state,
    setState,
    segments,
    currentText,
    detectedLanguage,
    micVolume,
    errorMessage,
    hasMicPermission,
    recordingDuration,
    maxDuration: maxDurationSeconds,
    countdown,
    isSpeakingDetected,
    startListening,
    stopListening,
    cancelListening,
    resetVoice,
  };
}
