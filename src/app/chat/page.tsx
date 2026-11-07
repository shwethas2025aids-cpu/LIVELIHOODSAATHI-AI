'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Send,
  Mic,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Paperclip,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Bookmark,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { apiService } from '@/services/api';
import { ttsService } from '@/services/ttsService';
import { ChatMessage, GuidanceRecommendation } from '@/types';
import { VoiceInteractionModal } from '@/components/voice/VoiceInteractionModal';
import { AudioRecorderModal } from '@/components/audio/AudioRecorderModal';
import { detectQuestionLanguage } from '@/lib/languageDetector';
import Link from 'next/link';

function ChatContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { currentLanguage, t } = useLanguage();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTtsId, setActiveTtsId] = useState<string | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isAudioUploadOpen, setIsAudioUploadOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load chat history
  useEffect(() => {
    const history = apiService.getHistory();
    if (history.length > 0) {
      setMessages(history);
    } else {
      const welcome: ChatMessage = {
        id: 'msg-welcome',
        sender: 'assistant',
        text:
          currentLanguage === 'ta-IN'
            ? 'வணக்கம்! நான் உங்கள் LIVELIHOODSAATHI வழிகாட்டி. வேலைவாய்ப்புகள், புதிய தொழில் திறன்கள் மற்றும் இலவச அரசு பயிற்சிகள் பற்றி எதை வேண்டுமானாலும் என்னிடம் தமிழில் அல்லது ஆங்கிலத்தில் கேளுங்கள்.'
            : 'Welcome! I am your LIVELIHOODSAATHI Career Mentor. Ask me anything about high-demand skills, subsidized government certifications, or career roadmaps in Tamil or English.',
        timestamp: new Date().toISOString(),
      };
      setMessages([welcome]);
      apiService.saveHistory([welcome]);
    }
  }, [currentLanguage]);

  // Handle incoming query param ?msg=...
  useEffect(() => {
    const initialQuery = searchParams.get('msg');
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMessage];
    setMessages(updated);
    setInputText('');
    setIsLoading(true);

    try {
      const detectedLang = detectQuestionLanguage(textToSend, currentLanguage);
      const res = await apiService.getAIGuidance({
        message: textToSend,
        language: detectedLang,
        user,
        history: updated,
      });

      const effectiveLanguage = res.detected_language || detectedLang;
      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.message,
        detected_language: effectiveLanguage,
        recommendations: res.recommendations,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updated, assistantMessage];
      setMessages(finalMessages);
      apiService.saveHistory(finalMessages);

      setActiveTtsId(assistantMessage.id);
      await ttsService.play(res.message, effectiveLanguage);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAudio = (msgId: string, text: string, lang?: string) => {
    if (activeTtsId === msgId) {
      ttsService.stop();
      setActiveTtsId(null);
    } else {
      setActiveTtsId(msgId);
      const effectiveLang = lang || detectQuestionLanguage(text, currentLanguage);
      ttsService.play(text, effectiveLang);
    }
  };

  const clearChat = () => {
    ttsService.stop();
    setMessages([]);
    apiService.saveHistory([]);
  };

  const quickPills = [
    'நான் 2-ஆம் ஆண்டு இன்ஜினியரிங் படிக்கிறேன், இன்டர்ன்ஷிப் வாங்க என்ன செய்ய வேண்டும்?',
    'How can I get an internship in 2nd year engineering before graduation?',
    'Naan second year engineering padikuren, internship epdi vaangurathu?',
    'I want to start a career in Cybersecurity. What is the roadmap?',
    'What career options are available after mechanical engineering?',
    'How do I prepare for technical interviews and coding rounds?',
  ];

  return (
    <div className="mx-auto flex h-[calc(100vh-130px)] max-w-5xl flex-col px-4 py-4 sm:px-6 bg-[#090909] text-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between border border-white/10 bg-[#121118] px-4 py-3 rounded-2xl shadow-sm mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#160B24] border border-[#E98AE0]/30 text-[#E98AE0] shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white">
              AI Career &amp; Livelihood Mentor
            </h2>
            <p className="text-[11px] text-[#A7A7A7]">
              Multilingual advisory • Tamil, English, Tanglish &amp; Hindi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVoiceOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#160B24] px-3 py-1.5 text-xs font-semibold text-[#E98AE0] border border-[#E98AE0]/30 hover:bg-[#201034] transition cursor-pointer"
          >
            <Mic className="h-3.5 w-3.5 text-[#E98AE0]" />
            <span className="hidden sm:inline">Voice Assistant</span>
          </button>

          <button
            onClick={clearChat}
            className="rounded-xl p-1.5 text-[#A7A7A7] hover:bg-white/10 hover:text-white transition cursor-pointer"
            title="Clear Chat History"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-4 p-2 sm:p-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#160B24] border border-[#E98AE0]/30 text-[#E98AE0] shadow-xs mt-1">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-xs leading-relaxed shadow-sm ${isUser
                    ? 'bg-gradient-to-r from-[#E98AE0] to-[#9333EA] text-black font-semibold rounded-tr-none'
                    : 'bg-[#121118] text-white border border-white/10 rounded-tl-none'
                  }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-[10px] font-bold ${isUser ? 'text-black/70' : 'text-[#A7A7A7]'}`}>
                    {isUser ? 'You' : 'LIVELIHOODSAATHI AI'}
                  </span>
                  {!isUser && (
                    <button
                      onClick={() => handleToggleAudio(msg.id, msg.text, msg.detected_language)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E98AE0] hover:underline cursor-pointer"
                    >
                      {activeTtsId === msg.id ? (
                        <>
                          <VolumeX className="h-3.5 w-3.5 text-rose-400" /> Stop
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5" /> Listen
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="whitespace-pre-line text-xs sm:text-[13px] leading-relaxed">
                  {msg.text}
                </p>

                {msg.recommendations && (
                  <div className="mt-4 pt-3 border-t border-white/10 space-y-3">
                    {msg.recommendations.skills.length > 0 && (
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A7A7A7] block mb-1.5">
                          Suggested Skills:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.recommendations.skills.map((sk) => (
                            <div
                              key={sk.id}
                              className="rounded-xl border border-white/10 bg-[#090909] p-2.5 flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-white block text-xs">
                                  {sk.name}
                                </span>
                                <span className="text-[10px] text-[#A7A7A7]">
                                  {sk.category} • {sk.difficulty}
                                </span>
                              </div>
                              <span className="rounded bg-[#160B24] px-1.5 py-0.5 text-[10px] font-bold text-[#E98AE0] border border-[#E98AE0]/30">
                                {sk.avgSalaryBoost}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.recommendations.courses.length > 0 && (
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A7A7A7] block mb-1.5">
                          Recommended Subsidized Courses:
                        </span>
                        <div className="space-y-2">
                          {msg.recommendations.courses.map((course) => (
                            <div
                              key={course.id}
                              className="rounded-xl border border-white/10 bg-[#090909] p-2.5 flex items-center justify-between gap-2"
                            >
                              <div>
                                <span className="font-bold text-white block text-xs">
                                  {course.title}
                                </span>
                                <span className="text-[10px] text-[#A7A7A7]">
                                  {course.provider} • {course.duration}
                                </span>
                              </div>
                              <a
                                href={course.platformUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#E98AE0] to-[#9333EA] px-2.5 py-1 text-[11px] font-bold text-black hover:opacity-90 transition"
                              >
                                Enroll <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.recommendations.nextSteps.length > 0 && (
                      <div className="rounded-xl bg-[#160B24] p-3 border border-[#E98AE0]/20 text-[11px] text-slate-300">
                        <span className="font-bold text-[#E98AE0] block mb-1">
                          Recommended Immediate Step:
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {msg.recommendations.nextSteps.map((st, i) => (
                            <li key={i}>{st}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/15 text-white font-bold text-xs mt-1">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#160B24] border border-[#E98AE0]/30 text-[#E98AE0] shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#121118] p-3.5 shadow-xs flex items-center gap-2 text-xs text-[#A7A7A7] font-medium">
              <Loader2 className="h-4 w-4 animate-spin text-[#E98AE0]" />
              <span>LIVELIHOODSAATHI is analyzing your question...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 text-xs">
        <span className="text-[11px] font-semibold text-[#A7A7A7] shrink-0">Suggestions:</span>
        {quickPills.map((pill, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(pill)}
            className="shrink-0 rounded-full border border-white/10 bg-[#121118] px-3 py-1 text-slate-300 hover:border-[#E98AE0]/40 hover:text-[#E98AE0] transition font-medium text-[11px] cursor-pointer"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Input Composer */}
      <div className="rounded-2xl border border-white/15 bg-[#121118] p-2 shadow-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() => setIsAudioUploadOpen(true)}
            className="rounded-xl p-2 text-[#A7A7A7] hover:bg-white/10 hover:text-white transition cursor-pointer"
            title="Upload Audio File for Transcription"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsVoiceOpen(true)}
            className="rounded-xl bg-[#160B24] border border-[#E98AE0]/30 p-2 text-[#E98AE0] hover:bg-[#201034] transition cursor-pointer"
            title="Start Live Voice Assistant"
          >
            <Mic className="h-4 w-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your question or career goal in Tamil, English, Tanglish, or Hindi..."
            className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-white placeholder:text-[#A7A7A7] focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-[#E98AE0] to-[#9333EA] text-black font-bold shadow-md shadow-pink-500/20 hover:opacity-90 disabled:opacity-40 transition cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Modals */}
      <VoiceInteractionModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onNavigateToChat={(transcript) => {
          setInputText(transcript);
        }}
      />

      <AudioRecorderModal
        isOpen={isAudioUploadOpen}
        onClose={() => setIsAudioUploadOpen(false)}
        onTranscriptSubmitted={(transcript) => {
          handleSendMessage(transcript);
        }}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-xs text-[#A7A7A7] bg-[#090909]">
          Loading AI Chat Interface...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
