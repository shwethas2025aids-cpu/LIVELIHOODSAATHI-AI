'use client';

import React, { useState, useEffect } from 'react';
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
  X,
  AlertCircle,
  CheckCircle2,
  Globe,
  Loader2,
  ArrowRight,
  Clock,
  Radio,
} from 'lucide-react';
import { useVoiceStream } from '@/hooks/useVoiceStream';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { ttsService } from '@/services/ttsService';
import { GuidanceRecommendation, LanguageCode } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import { detectQuestionLanguage } from '@/lib/languageDetector';
import Link from 'next/link';

interface VoiceInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToChat?: (initialMessage: string) => void;
}

export const VoiceInteractionModal: React.FC<VoiceInteractionModalProps> = ({
  isOpen,
  onClose,
  onNavigateToChat,
}) => {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  const [aiResponseText, setAiResponseText] = useState<string>('');
  const [recommendations, setRecommendations] = useState<GuidanceRecommendation | null>(null);
  const [ttsState, setTtsState] = useState<'idle' | 'loading' | 'playing' | 'paused' | 'error'>('idle');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [editableTranscript, setEditableTranscript] = useState('');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

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

  // Keep editable transcript in sync while streaming
  useEffect(() => {
    if (currentText) {
      setEditableTranscript(currentText);
    }
  }, [currentText]);

  // Subscribe to TTS changes
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

  if (!isOpen) return null;

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

      // Auto-play TTS response using exact detected language from the AI response
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

  // State Machine labels & indicators
  const getStateBadge = () => {
    switch (voiceState) {
      case 'ready':
        return { label: 'Ready to Listen (120s Max)', color: 'bg-white/5 text-slate-300 border-white/10' };
      case 'connecting':
        return { label: 'Connecting to Audio Proxy...', color: 'bg-amber-950/40 text-amber-300 border-amber-500/30 animate-pulse' };
      case 'listening':
        return {
          label: isSpeakingDetected ? 'Voice Detected (Listening...)' : 'Listening (16kHz PCM)...',
          color: 'bg-rose-950/40 text-rose-300 border-rose-500/30 animate-pulse',
        };
      case 'processing':
        return { label: 'Processing Speech...', color: 'bg-indigo-950/40 text-indigo-300 border-indigo-500/30 animate-pulse' };
      case 'transcript_received':
        return { label: 'Transcript Complete', color: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30' };
      case 'thinking':
        return { label: 'AI Generating Guidance...', color: 'bg-purple-950/40 text-purple-300 border-purple-500/30 animate-pulse' };
      case 'response_received':
        return { label: 'Guidance Ready', color: 'bg-teal-950/40 text-teal-300 border-teal-500/30' };
      case 'speaking':
        return { label: 'Assistant Speaking (TTS)...', color: 'bg-[#160B24] text-[#E98AE0] border-[#E98AE0]/40 animate-pulse' };
      case 'error':
        return { label: 'Notice / Retry', color: 'bg-rose-950/50 text-rose-300 border-rose-500/40' };
    }
  };

  const badge = getStateBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-[#121118] border border-white/15 shadow-2xl text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#160B24] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#090909] border border-[#E98AE0]/30 text-[#E98AE0] shadow-sm">
              <Mic className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {t('voice_assistant_title')}
              </h3>
              <p className="text-[11px] text-[#A7A7A7]">
                Gnani / Vachana Multilingual Speech-to-Text &amp; Career AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Language Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#090909] px-3 py-1 text-[11px] font-semibold text-[#E98AE0] border border-[#E98AE0]/30 hover:border-[#E98AE0] transition cursor-pointer"
              >
                <Globe className="h-3 w-3 text-[#E98AE0]" />
                <span>{SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.nativeLabel || currentLanguage}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-white/15 bg-[#160B24] p-1.5 shadow-2xl z-50">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-left transition ${
                        currentLanguage === lang.code
                          ? 'bg-[#E98AE0]/20 font-bold text-[#E98AE0]'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeLabel}</span>
                      </span>
                      <span className="text-[10px] text-[#A7A7A7]">{lang.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                ttsService.stop();
                resetVoice();
                onClose();
              }}
              className="rounded-lg p-1.5 text-[#A7A7A7] hover:bg-white/10 hover:text-white transition cursor-pointer"
              aria-label="Close Voice Assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* State Stepper Bar */}
          <div className="flex items-center justify-between text-[11px] font-medium text-[#A7A7A7] bg-[#090909] p-2.5 rounded-xl border border-white/10">
            <span className="font-semibold text-white">Status:</span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold border ${badge.color}`}>
              {voiceState === 'listening' && <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />}
              {voiceState === 'speaking' && <Volume2 className="h-3 w-3 animate-bounce text-[#E98AE0]" />}
              {badge.label}
            </span>

            {/* Recording Timer / Max 120s */}
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-300">
              <Clock className="h-3 w-3 text-[#E98AE0]" />
              {voiceState === 'listening' ? `${formatTime(recordingDuration)} / ${formatTime(maxDuration)}` : '120s max'}
            </span>

            {hasMicPermission === false && (
              <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Mic Blocked
              </span>
            )}
          </div>

          {/* Central Interactive Voice Orb / Mic Circle */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing rings when listening */}
              {voiceState === 'listening' && (
                <>
                  <div
                    className="absolute h-36 w-36 rounded-full bg-rose-500/20 animate-ping"
                    style={{ animationDuration: '2s' }}
                  />
                  <div
                    className="absolute rounded-full bg-rose-500/25 transition-all duration-100"
                    style={{
                      width: `${80 + micVolume * 0.8}px`,
                      height: `${80 + micVolume * 0.8}px`,
                    }}
                  />
                </>
              )}

              {/* Pulsing ring when speaking */}
              {voiceState === 'speaking' && (
                <div className="absolute h-32 w-32 rounded-full bg-purple-500/30 animate-pulse" />
              )}

              {/* The Main Action Button */}
              <button
                onClick={handleToggleListening}
                className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full shadow-xl transition-all duration-300 cursor-pointer ${
                  voiceState === 'listening'
                    ? 'bg-rose-600 text-white ring-4 ring-rose-500/30 hover:bg-rose-700 scale-105'
                    : voiceState === 'speaking'
                    ? 'bg-gradient-to-tr from-rose-500 to-purple-600 text-white ring-4 ring-rose-500/30 hover:scale-105'
                    : 'bg-gradient-to-tr from-[#E98AE0] via-[#C084FC] to-[#9333EA] text-black ring-4 ring-[#E98AE0]/30 hover:scale-105'
                }`}
                aria-label={voiceState === 'listening' ? 'Stop Listening' : voiceState === 'speaking' ? 'Stop Voice Output' : 'Start Speaking'}
              >
                {voiceState === 'listening' ? (
                  <Square className="h-8 w-8 fill-current" />
                ) : voiceState === 'speaking' ? (
                  <Square className="h-8 w-8 fill-current text-white animate-pulse" />
                ) : (
                  <Mic className="h-9 w-9" />
                )}
              </button>
            </div>

            {/* Instruction Label & VAD Indicator */}
            <p className="mt-4 text-xs font-semibold text-slate-200 text-center max-w-md">
              {voiceState === 'listening'
                ? isSpeakingDetected
                  ? `Listening... (VAD Active • Natural pauses allowed • ${formatTime(countdown)} left)`
                  : `Listening... Speak continuously for up to 2 minutes (${formatTime(countdown)} left)`
                : voiceState === 'processing'
                ? 'Finalizing speech transcript...'
                : voiceState === 'thinking'
                ? 'Consulting career intelligence model...'
                : voiceState === 'speaking'
                ? 'Assistant is speaking. Tap orb or button below to stop voice immediately.'
                : 'Tap microphone to speak your question in Tamil, English, Tanglish, or Hindi.'}
            </p>

            {/* Action Buttons During Speaking: Immediate Stop Voice */}
            {voiceState === 'speaking' && (
              <div className="mt-3 flex items-center justify-center gap-2">
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

            {/* Action Buttons During Recording: Finish & Send + Cancel */}
            {voiceState === 'listening' && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={stopListening}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 px-3.5 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Finish &amp; Send ({formatTime(recordingDuration)})
                </button>
                <button
                  type="button"
                  onClick={cancelListening}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3.5 py-1 text-xs font-semibold text-slate-300 hover:bg-white/20 transition cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
              </div>
            )}

            {/* Audio Wave Visualizer Bars */}
            {voiceState === 'listening' && (
              <div className="mt-3 flex items-center justify-center gap-1.5 h-8">
                {[20, 45, 75, 95, 60, 85, 40, 65, 30, 90, 50].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-[#E98AE0] transition-all duration-75"
                    style={{
                      height: `${Math.max(6, (h * (micVolume + 15)) / 100)}px`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 1-Click Multilingual Voice Test Chips */}
          <div className="rounded-2xl border border-white/10 bg-[#090909] p-3 space-y-2">
            <span className="text-[10px] uppercase font-bold text-[#A7A7A7] tracking-wider block">
              1-Click Voice Test Queries (தமிழ், English, Tanglish, हिन्दी):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { lang: 'ta-IN', label: 'தமிழ்: 2nd Year Internship', text: 'நான் இரண்டாம் ஆண்டு இன்ஜினியரிங் படிக்கிறேன். என்னுடைய காலேஜ் படிப்பு முடிவதற்குள் நல்ல இன்டர்ன்ஷிப் வாங்க என்ன செய்ய வேண்டும்?' },
                { lang: 'en-IN', label: 'English: Internship Plan', text: 'How can I get a good internship in my second year before graduation?' },
                { lang: 'ta-en', label: 'Tanglish: Internship Guide', text: 'Naan second year engineering padikuren, internship epdi vaangurathu?' },
                { lang: 'hi-IN', label: 'हिन्दी: इंजीनियरिंग इंटर्नशिप', text: 'इंजीनियरिंग के दूसरे वर्ष में कॉलेज खत्म होने से पहले अच्छी इंटर्नशिप कैसे प्राप्त करें?' },
                { lang: 'ta-IN', label: 'தமிழ்: IT & AI வேலைகள்', text: 'எனக்கு IT துறையில் நல்ல சம்பளத்துடன் வேலை கிடைக்க என்ன திறன்கள் தேவை?' },
                { lang: 'en-IN', label: 'English: Web Development', text: 'I am interested in web development. What should I learn?' },
                { lang: 'en-IN', label: 'English: Mechanical Engineering', text: 'What career options are available after mechanical engineering?' },
                { lang: 'en-IN', label: 'English: Cybersecurity Path', text: 'I am interested in cybersecurity. How do I start?' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setLanguage(p.lang as LanguageCode);
                    setEditableTranscript(p.text);
                    handleAskAI(p.text, p.lang);
                  }}
                  className="rounded-lg bg-[#160B24] border border-[#E98AE0]/30 px-2.5 py-1 text-[11px] font-medium text-[#E98AE0] hover:bg-[#E98AE0]/20 hover:scale-102 transition cursor-pointer"
                >
                  ⚡ {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Transcript Box */}
          <div className="rounded-2xl border border-white/10 bg-[#090909] p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Mic className="h-3.5 w-3.5 text-[#E98AE0]" /> Speech Transcript
              </span>
              {segments.length > 0 && (
                <span className="text-[11px] text-[#A7A7A7]">
                  {segments.length} segment{segments.length > 1 ? 's' : ''} captured
                </span>
              )}
            </div>

            <textarea
              value={editableTranscript}
              onChange={(e) => setEditableTranscript(e.target.value)}
              placeholder="Your continuous speech transcript will appear here in real-time (up to 120 seconds). You can also edit or type directly..."
              rows={3}
              className="w-full rounded-xl border border-white/15 bg-[#080808] p-3 text-xs text-white placeholder:text-[#A7A7A7] focus:border-[#E98AE0] focus:outline-none focus:ring-1 focus:ring-[#E98AE0] transition resize-none"
            />

            {/* Action Bar for Transcript */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                {editableTranscript && (
                  <button
                    onClick={handleRestart}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-[#A7A7A7] hover:text-white transition cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={!editableTranscript.trim() || isAiThinking || voiceState === 'listening'}
                  onClick={() => handleAskAI(editableTranscript)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E98AE0] to-[#9333EA] px-3.5 py-1.5 text-xs font-bold text-black shadow hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
                >
                  {isAiThinking ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-black" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-black" /> Ask AI Guidance
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* AI Response Section */}
          {aiResponseText && (
            <div className="rounded-2xl border border-white/10 bg-[#160B24] p-4 space-y-3 animate-in fade-in shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#090909] border border-[#E98AE0]/30 text-[#E98AE0]">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white">
                    LIVELIHOODSAATHI Career Recommendation
                  </span>
                </div>

                {/* Audio Playback Controls */}
                <div className="flex items-center gap-1.5">
                  {ttsState === 'playing' ? (
                    <>
                      <button
                        onClick={() => ttsService.pause()}
                        className="inline-flex items-center gap-1 rounded-md bg-white/10 border border-white/15 px-2.5 py-1 text-xs font-medium text-white hover:bg-white/20 transition shadow-sm cursor-pointer"
                      >
                        <Pause className="h-3 w-3 text-[#E98AE0]" /> Pause
                      </button>
                      <button
                        onClick={() => {
                          ttsService.stop();
                          setVoiceState('response_received');
                        }}
                        className="inline-flex items-center gap-1 rounded-md bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 text-xs font-bold text-rose-300 hover:bg-rose-500/30 transition shadow-sm cursor-pointer"
                        title="Stop Voice Output Immediately"
                      >
                        <Square className="h-3 w-3 fill-current" /> Stop Voice
                      </button>
                    </>
                  ) : ttsState === 'paused' ? (
                    <>
                      <button
                        onClick={() => ttsService.resume()}
                        className="inline-flex items-center gap-1 rounded-md bg-white/10 border border-white/15 px-2.5 py-1 text-xs font-medium text-white hover:bg-white/20 transition shadow-sm cursor-pointer"
                      >
                        <Play className="h-3 w-3 text-[#E98AE0]" /> Resume
                      </button>
                      <button
                        onClick={() => {
                          ttsService.stop();
                          setVoiceState('response_received');
                        }}
                        className="inline-flex items-center gap-1 rounded-md bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 text-xs font-bold text-rose-300 hover:bg-rose-500/30 transition shadow-sm cursor-pointer"
                        title="Stop Voice Output Immediately"
                      >
                        <Square className="h-3 w-3 fill-current" /> Stop Voice
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => ttsService.play(aiResponseText, detectedLanguage || currentLanguage)}
                      className="inline-flex items-center gap-1 rounded-md bg-white/10 border border-white/15 px-2.5 py-1 text-xs font-medium text-white hover:bg-white/20 transition shadow-sm cursor-pointer"
                    >
                      <Volume2 className="h-3 w-3 text-[#E98AE0]" /> Play Voice
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-line bg-[#090909] p-3.5 rounded-xl border border-white/10">
                {aiResponseText}
              </div>

              {/* Recommended Career Pathways & Courses */}
              {recommendations && (
                <div className="pt-2 space-y-3">
                  {recommendations.careerPathways && recommendations.careerPathways.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-white flex items-center gap-1">
                        <ArrowRight className="h-3 w-3 text-[#E98AE0]" /> Top Matched Pathway:
                      </span>
                      <div className="rounded-xl border border-white/10 bg-[#090909] p-3 text-xs">
                        <div className="font-bold text-[#E98AE0]">
                          {recommendations.careerPathways[0].title}
                        </div>
                        <div className="text-[11px] text-[#A7A7A7] mt-0.5">
                          {recommendations.careerPathways[0].sector} • {recommendations.careerPathways[0].avgStartingSalary}
                        </div>
                      </div>
                    </div>
                  )}

                  {recommendations.nextSteps && recommendations.nextSteps.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-white flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Actionable Next Steps:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 bg-[#090909] p-3 rounded-xl border border-white/10">
                        {recommendations.nextSteps.map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
