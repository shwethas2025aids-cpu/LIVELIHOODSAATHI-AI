'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Square,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Send,
  AlertCircle,
  CheckCircle2,
  Globe,
  Loader2,
  ArrowRight,
  Bookmark,
  ExternalLink,
  MessageSquare,
  Clock,
  Radio,
  X,
} from 'lucide-react';
import { useVoiceStream } from '@/hooks/useVoiceStream';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { ttsService } from '@/services/ttsService';
import { GuidanceRecommendation, LanguageCode } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import { detectQuestionLanguage } from '@/lib/languageDetector';

export default function VoiceAssistantPage() {
  const router = useRouter();
  const { currentLanguage, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  const [aiResponseText, setAiResponseText] = useState<string>('');
  const [recommendations, setRecommendations] = useState<GuidanceRecommendation | null>(null);
  const [ttsState, setTtsState] = useState<'idle' | 'loading' | 'playing' | 'paused' | 'error'>('idle');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [editableTranscript, setEditableTranscript] = useState('');

  const {
    state: voiceState,
    setState: setVoiceState,
    segments,
    currentText,
    detectedLanguage,
    micVolume,
    errorMessage,
    hasMicPermission,
    recordingDuration,
    maxDuration,
    countdown,
    isSpeakingDetected,
    startListening,
    stopListening,
    cancelListening,
    resetVoice,
  } = useVoiceStream({
    language: currentLanguage,
    maxDurationSeconds: 120, // 2 minutes continuous voice
    silenceTimeoutSeconds: 3.0, // Natural pause tolerance
    enableSilenceDetection: true,
    onTranscriptComplete: (finalText, lang) => {
      setEditableTranscript(finalText);
      if (finalText && finalText.trim()) {
        handleAskAI(finalText, lang);
      }
    },
    onError: (err) => {
      console.warn('Voice Stream Error:', err);
    },
  });

  useEffect(() => {
    if (currentText) {
      setEditableTranscript(currentText);
    }
  }, [currentText]);

  useEffect(() => {
    const unsub = ttsService.subscribe({
      onStateChange: (newState) => {
        setTtsState(newState);
        if (newState === 'playing') {
          setVoiceState('speaking');
        } else if (newState === 'idle' && voiceState === 'speaking') {
          setVoiceState('response_received');
        }
      },
    });
    return () => unsub();
  }, [voiceState, setVoiceState]);

  const handleAskAI = async (transcriptToSend: string, targetLang?: string) => {
    if (!transcriptToSend.trim()) return;

    try {
      setIsAiThinking(true);
      setVoiceState('thinking');
      ttsService.stop();

      const langToUse = detectQuestionLanguage(
        transcriptToSend,
        targetLang || detectedLanguage || currentLanguage
      );
      const res = await apiService.getAIGuidance({
        message: transcriptToSend,
        language: langToUse,
        user,
      });

      setAiResponseText(res.message);
      setRecommendations(res.recommendations || null);
      setVoiceState('response_received');

      // Auto play TTS response using exact detected language from the AI response
      const voiceLang = res.detected_language || langToUse;
      await ttsService.play(res.message, voiceLang);
    } catch (err) {
      console.error('Failed to get AI guidance:', err);
      setVoiceState('error');
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleToggleListening = () => {
    if (voiceState === 'listening') {
      stopListening();
    } else if (voiceState === 'speaking' || ttsState === 'playing') {
      ttsService.stop();
      setVoiceState('response_received');
    } else {
      ttsService.stop();
      setAiResponseText('');
      setRecommendations(null);
      resetVoice();
      startListening();
    }
  };

  const handleRestart = () => {
    ttsService.stop();
    resetVoice();
    setAiResponseText('');
    setRecommendations(null);
    setEditableTranscript('');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const stepsList: { key: string; label: string }[] = [
    { key: 'ready', label: 'Ready' },
    { key: 'connecting', label: 'Connecting' },
    { key: 'listening', label: 'Listening (120s)' },
    { key: 'processing', label: 'Processing' },
    { key: 'transcript_received', label: 'Transcript' },
    { key: 'thinking', label: 'AI Thinking' },
    { key: 'response_received', label: 'Response' },
    { key: 'speaking', label: 'Speaking' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 bg-[#090909] text-white min-h-[calc(100vh-4rem)]">
      {/* Header & Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#160B24] border border-[#E98AE0]/30 px-3 py-1 text-xs font-bold text-[#E98AE0] flex items-center gap-1.5 shadow-[0_0_12px_rgba(233,138,224,0.15)]">
              <Sparkles className="h-3.5 w-3.5 text-[#E98AE0]" />
              AI Voice Career Guide (120s Continuous Voice)
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('voice_assistant_title')}
          </h1>
          <p className="mt-1 text-xs text-[#A7A7A7]">
            Speak in Tamil, English, Tanglish, or Hindi. Low-latency AI speech engine analyzes your profile and provides spoken career recommendations.
          </p>
        </div>

        {/* Language selector chips */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#121118] p-1 rounded-2xl border border-white/10">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentLanguage === lang.code
                  ? 'bg-gradient-to-r from-[#E98AE0] to-[#9333EA] text-black shadow-md font-bold'
                  : 'text-[#A7A7A7] hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress & Lifecycle Stepper Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#121118] p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs font-medium text-[#A7A7A7] mb-3">
          <span className="font-semibold text-white">Assistant State Pipeline:</span>
          <span className="font-mono text-[#E98AE0] font-bold">
            {voiceState === 'listening' ? `Recording: ${formatTime(recordingDuration)} / ${formatTime(maxDuration)}` : `Current: ${voiceState.toUpperCase()}`}
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {stepsList.map((st) => {
            const isActive = voiceState === st.key;
            return (
              <div
                key={st.key}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all ${
                  isActive
                    ? 'bg-[#160B24] border border-[#E98AE0]/50 text-[#E98AE0] font-bold shadow-[0_0_10px_rgba(233,138,224,0.2)]'
                    : 'bg-[#090909] text-[#A7A7A7] border border-white/5'
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full mb-1 ${
                    isActive ? 'bg-[#E98AE0] animate-ping' : 'bg-white/20'
                  }`}
                />
                <span className="text-[10px] truncate max-w-full">{st.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CENTRAL VOICE ORB HERO */}
      <div className="rounded-3xl border border-white/10 bg-[#121118] p-8 sm:p-12 text-center shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-96 bg-[#160B24] rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="relative flex items-center justify-center py-6 z-10">
          {voiceState === 'listening' && (
            <>
              <div className="absolute h-48 w-48 rounded-full bg-pink-500/10 animate-ping" />
              <div
                className="absolute rounded-full bg-pink-500/20 transition-all duration-75"
                style={{
                  width: `${110 + micVolume}px`,
                  height: `${110 + micVolume}px`,
                }}
              />
            </>
          )}

          {voiceState === 'speaking' && (
            <div className="absolute h-44 w-44 rounded-full bg-purple-500/20 animate-pulse" />
          )}

          <button
            onClick={handleToggleListening}
            className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full shadow-2xl transition-all duration-300 cursor-pointer ${
              voiceState === 'listening'
                ? 'bg-rose-500 text-white ring-8 ring-rose-500/20 hover:bg-rose-600 scale-105'
                : voiceState === 'speaking'
                ? 'bg-gradient-to-tr from-[#E98AE0] to-[#9333EA] text-black ring-8 ring-purple-500/20'
                : 'bg-gradient-to-tr from-[#E98AE0] via-[#C084FC] to-[#9333EA] text-black ring-8 ring-[#E98AE0]/20 hover:scale-105'
            }`}
            aria-label={voiceState === 'listening' ? 'Stop Listening' : 'Start Speaking'}
          >
            {voiceState === 'listening' ? (
              <Square className="h-10 w-10 fill-current" />
            ) : voiceState === 'speaking' ? (
              <Square className="h-10 w-10 fill-current text-white animate-pulse" />
            ) : (
              <Mic className="h-10 w-10" />
            )}
          </button>
        </div>

        <div className="max-w-md mx-auto space-y-2 relative z-10">
          <h3 className="text-base font-bold text-white">
            {voiceState === 'listening'
              ? isSpeakingDetected
                ? `Voice Detected • Listening... (${formatTime(countdown)} left)`
                : `Listening... Speak continuously for up to 2 minutes (${formatTime(countdown)} left)`
              : voiceState === 'processing'
              ? 'Transcribing and finalizing speech...'
              : voiceState === 'thinking'
              ? 'AI is analyzing career recommendations...'
              : voiceState === 'speaking'
              ? 'Assistant is speaking. Tap orb or button below to stop voice immediately.'
              : 'Tap microphone to speak career question'}
          </h3>
          <p className="text-xs text-[#A7A7A7]">
            {voiceState === 'listening'
              ? 'Intelligent VAD is active: Natural pauses up to 3s allowed. Speak as long as you need (up to 120s).'
              : 'Speak freely in Tamil, English, Tanglish, or Hindi. No complex terms required.'}
          </p>

          {/* Action Button During Speaking */}
          {voiceState === 'speaking' && (
            <div className="pt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  ttsService.stop();
                  setVoiceState('response_received');
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/50 px-4 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30 transition shadow-md cursor-pointer"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                Stop Voice Output
              </button>
            </div>
          )}

          {/* Action Buttons During Recording */}
          {voiceState === 'listening' && (
            <div className="pt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={stopListening}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 px-4 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Finish &amp; Send ({formatTime(recordingDuration)})
              </button>
              <button
                type="button"
                onClick={cancelListening}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/20 transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          )}

          {/* Waveform Bars */}
          {voiceState === 'listening' && (
            <div className="flex items-center justify-center gap-1.5 h-10 pt-2">
              {[25, 60, 90, 45, 80, 100, 70, 40, 85, 30, 95, 50, 75].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-[#E98AE0] transition-all duration-75"
                  style={{
                    height: `${Math.max(6, (h * (micVolume + 20)) / 100)}px`,
                  }}
                />
              ))}
            </div>
          )}

          {/* 1-Click Fast Voice Testing Queries for all 4 languages */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <span className="text-[10px] uppercase font-bold text-[#A7A7A7] tracking-wider block">
              1-Click Voice Test Queries (தமிழ், English, Tanglish, हिन्दी):
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { lang: 'ta-IN', label: 'தமிழ்: 2nd Year Internship', text: 'நான் இரண்டாம் ஆண்டு இன்ஜினியரிங் படிக்கிறேன். என்னுடைய காலேஜ் படிப்பு முடிவதற்குள் நல்ல இன்டர்ன்ஷிப் வாங்க என்ன செய்ய வேண்டும்?' },
                { lang: 'en-IN', label: 'English: 2nd Year Internship', text: 'How can I get a good internship before I graduate as a second-year engineering student?' },
                { lang: 'ta-en', label: 'Tanglish: 2nd Year Internship', text: 'Naan second year engineering padikuren, college mudiyarathukulla nalla internship epdi vaangurathu?' },
                { lang: 'hi-IN', label: 'हिन्दी: 2nd Year इंटर्नशिप', text: 'मैं इंजीनियरिंग के दूसरे वर्ष में हूँ, कॉलेज पूरा होने से पहले एक अच्छी इंटर्नशिप कैसे प्राप्त करूँ?' },
                { lang: 'en-IN', label: 'English: Cybersecurity', text: 'I am interested in cybersecurity. How do I start?' },
                { lang: 'en-IN', label: 'English: Mechanical Careers', text: 'What career options are available after mechanical engineering?' },
                { lang: 'ta-IN', label: 'தமிழ்: IT & AI வேலைகள்', text: 'எனக்கு IT துறையில் நல்ல சம்பளத்துடன் வேலை கிடைக்க என்ன திறன்கள் தேவை?' },
                { lang: 'ta-en', label: 'Tanglish: EV Training', text: 'Electric vehicle maintenance course pathi details solla mudiyuma?' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setLanguage(p.lang as LanguageCode);
                    setEditableTranscript(p.text);
                    handleAskAI(p.text, p.lang);
                  }}
                  className="rounded-xl bg-[#160B24] border border-[#E98AE0]/30 px-3 py-1.5 text-xs font-semibold text-[#E98AE0] hover:bg-[#E98AE0]/20 hover:scale-102 transition cursor-pointer"
                >
                  ⚡ {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* REAL-TIME SPEECH TRANSCRIPT BOX */}
      <div className="rounded-3xl border border-white/10 bg-[#121118] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
          <span className="font-bold text-white flex items-center gap-2">
            <Mic className="h-4 w-4 text-[#E98AE0]" /> Speech Transcript (STT Output)
          </span>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#160B24] border border-[#E98AE0]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#E98AE0]">
              Language: {detectedLanguage || currentLanguage}
            </span>
          </div>
        </div>

        <textarea
          value={editableTranscript}
          onChange={(e) => setEditableTranscript(e.target.value)}
          placeholder="Speak into microphone or select a 1-click test query above. Continuous speech transcript will populate here without truncating..."
          rows={3}
          className="w-full rounded-2xl border border-white/10 bg-[#090909] p-4 text-xs text-white placeholder:text-[#A7A7A7] focus:border-[#E98AE0] focus:outline-none focus:ring-1 focus:ring-[#E98AE0] transition resize-none"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            {editableTranscript && (
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#090909] px-3 py-1.5 text-xs font-semibold text-[#A7A7A7] hover:text-white transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={!editableTranscript.trim() || isAiThinking || voiceState === 'listening'}
              onClick={() => handleAskAI(editableTranscript)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E98AE0] to-[#9333EA] px-5 py-2 text-xs font-bold text-black shadow-lg hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
            >
              {isAiThinking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-black" /> Generating Guidance...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-black" /> Ask AI Career Guidance
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI GUIDANCE & SPOKEN RECOMMENDATIONS */}
      {aiResponseText && (
        <div className="rounded-3xl border border-white/10 bg-[#160B24] p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#090909] border border-[#E98AE0]/30 text-[#E98AE0]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  LIVELIHOODSAATHI AI Career Guidance
                </h3>
                <span className="text-[11px] text-[#A7A7A7]">
                  Scikit-Learn Recommender + Gnani Reasoning Engine
                </span>
              </div>
            </div>

            {/* Audio Controls */}
            <div className="flex items-center gap-2">
              {ttsState === 'playing' ? (
                <>
                  <button
                    onClick={() => ttsService.pause()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition cursor-pointer"
                  >
                    <Pause className="h-3.5 w-3.5 text-[#E98AE0]" /> Pause Voice
                  </button>
                  <button
                    onClick={() => {
                      ttsService.stop();
                      setVoiceState('response_received');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30 transition shadow-sm cursor-pointer"
                    title="Stop Voice Output Immediately"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" /> Stop Voice
                  </button>
                </>
              ) : ttsState === 'paused' ? (
                <>
                  <button
                    onClick={() => ttsService.resume()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 text-[#E98AE0]" /> Resume Voice
                  </button>
                  <button
                    onClick={() => {
                      ttsService.stop();
                      setVoiceState('response_received');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30 transition shadow-sm cursor-pointer"
                    title="Stop Voice Output Immediately"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" /> Stop Voice
                  </button>
                </>
              ) : (
                <button
                  onClick={() => ttsService.play(aiResponseText, detectedLanguage || currentLanguage)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition cursor-pointer"
                >
                  <Volume2 className="h-3.5 w-3.5 text-[#E98AE0]" /> Play Spoken Guidance
                </button>
              )}
            </div>
          </div>

          {/* Assistant Text Response */}
          <div className="rounded-2xl border border-white/10 bg-[#090909] p-5 text-xs sm:text-sm leading-relaxed text-slate-200 whitespace-pre-line">
            {aiResponseText}
          </div>

          {/* Actionable Next Steps */}
          {recommendations?.nextSteps && recommendations.nextSteps.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Actionable Next Steps:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommendations.nextSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-[#090909] p-4 text-xs space-y-1"
                  >
                    <span className="text-[10px] font-bold text-[#E98AE0]">Step {idx + 1}</span>
                    <p className="text-slate-300 leading-normal">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Career Pathways */}
          {recommendations?.careerPathways && recommendations.careerPathways.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-[#E98AE0]" /> Recommended Career Pathway:
              </h4>
              <div className="rounded-2xl border border-white/10 bg-[#090909] p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h5 className="text-sm font-bold text-white">
                      {recommendations.careerPathways[0].title}
                    </h5>
                    <p className="text-xs text-[#A7A7A7]">
                      {recommendations.careerPathways[0].sector} • {recommendations.careerPathways[0].avgStartingSalary}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300 self-start sm:self-auto">
                    {recommendations.careerPathways[0].growthRate}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {recommendations.careerPathways[0].description}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 text-xs text-rose-300 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <div className="font-bold text-rose-200">Voice Assistant Notice</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}
    </div>
  );
}
