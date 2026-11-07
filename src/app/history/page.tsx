'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  History,
  MessageSquare,
  Volume2,
  Trash2,
  ArrowRight,
  Sparkles,
  Calendar,
  Globe,
  Share2,
} from 'lucide-react';
import { ChatMessage } from '@/types';
import { apiService } from '@/services/api';
import { ttsService } from '@/services/ttsService';

export default function HistoryPage() {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const list = apiService.getHistory();
    setHistory(list);
  };

  const handleClearHistory = () => {
    if (confirm('Clear all conversation history?')) {
      apiService.saveHistory([]);
      ttsService.stop();
      setHistory([]);
    }
  };

  const handlePlayVoice = (msg: ChatMessage) => {
    if (playingId === msg.id) {
      ttsService.stop();
      setPlayingId(null);
    } else {
      setPlayingId(msg.id);
      ttsService.play(msg.text, msg.detected_language || 'ta-IN');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 bg-[#090909] text-white min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#160B24] border border-[#E98AE0]/30 px-3 py-1 text-xs font-semibold text-[#E98AE0] mb-2">
            <History className="h-3.5 w-3.5" />
            <span>Activity &amp; Voice Transcripts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Conversation History
          </h1>
          <p className="text-xs text-[#A7A7A7]">
            Review past voice transcripts and AI career guidance messages.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/50 transition cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear History
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`rounded-2xl border p-5 shadow-sm transition ${isUser
                    ? 'border-white/10 bg-[#121118]'
                    : 'border-white/10 bg-[#160B24]'
                  }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${isUser
                          ? 'bg-[#1A1823] text-slate-300 border border-white/10'
                          : 'bg-gradient-to-r from-[#E98AE0] to-[#9333EA] text-black font-bold'
                        }`}
                    >
                      {isUser ? 'User Voice/Query' : 'Saathi AI Response'}
                    </span>
                    {msg.detected_language && (
                      <span className="flex items-center gap-1 text-[11px] text-[#A7A7A7] font-medium">
                        <Globe className="h-3 w-3 text-[#E98AE0]" />
                        {msg.detected_language}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-[#A7A7A7]">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                  {msg.text}
                </p>

                {/* Audio replay button for assistant */}
                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => handlePlayVoice(msg)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E98AE0] hover:underline transition cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>{playingId === msg.id ? 'Pause Voice' : 'Play Voice Answer'}</span>
                    </button>

                    <Link
                      href={`/chat?msg=${encodeURIComponent(msg.text)}`}
                      className="text-xs font-semibold text-[#A7A7A7] hover:text-white flex items-center gap-1"
                    >
                      Resume in Chat <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/15 bg-[#121118] p-12 text-center space-y-3">
          <MessageSquare className="mx-auto h-8 w-8 text-[#A7A7A7]" />
          <h3 className="text-sm font-bold text-white">No conversations recorded yet</h3>
          <p className="text-xs text-[#A7A7A7] max-w-sm mx-auto">
            Interact with our Voice Assistant or Text Chat to see your complete advisory log here.
          </p>
          <div className="pt-2">
            <Link
              href="/voice-assistant"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#E98AE0] to-[#9333EA] px-5 py-2 text-xs font-bold text-black hover:opacity-90 transition"
            >
              Start Voice Conversation
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
