'use client';

import React, { useState } from 'react';
import {
  Settings,
  Globe,
  Volume2,
  Mic,
  Sliders,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import { LanguageCode } from '@/types';
import { AudioStreamProcessor } from '@/lib/audioProcessor';

export default function SettingsPage() {
  const { currentLanguage, setLanguage } = useLanguage();
  const { user, logout } = useAuth();

  const [speechRate, setSpeechRate] = useState(1.0);
  const [autoPlayTts, setAutoPlayTts] = useState(true);
  const [lowBandwidthMode, setLowBandwidthMode] = useState(true);
  const [testMicActive, setTestMicActive] = useState(false);
  const [testMicVolume, setTestMicVolume] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [micProcessor, setMicProcessor] = useState<AudioStreamProcessor | null>(null);

  const toggleTestMic = async () => {
    if (testMicActive) {
      if (micProcessor) {
        micProcessor.stop();
        setMicProcessor(null);
      }
      setTestMicActive(false);
      setTestMicVolume(0);
    } else {
      try {
        const proc = new AudioStreamProcessor({
          sampleRate: 16000,
          samplesPerFrame: 512,
          onAudioFrame: () => {},
          onVolumeChange: (vol) => setTestMicVolume(vol),
          onError: () => setTestMicActive(false),
        });
        await proc.start();
        setMicProcessor(proc);
        setTestMicActive(true);
      } catch (e) {
        alert('Could not access microphone: ' + e);
      }
    }
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const exportData = () => {
    const data = {
      user,
      language: currentLanguage,
      saved: localStorage.getItem('livelihoodsaathi_saved'),
      history: localStorage.getItem('livelihoodsaathi_chat_history'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `livelihoodsaathi-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#090909] text-white min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b border-white/10 pb-5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#160B24] border border-[#E98AE0]/30 px-3 py-1 text-xs font-semibold text-[#E98AE0] mb-2">
          <Settings className="h-3.5 w-3.5" />
          <span>System &amp; Voice Configuration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Preferences &amp; Language Settings
        </h1>
        <p className="text-xs text-[#A7A7A7]">
          Customize speech synthesis speed, dialect selection, and acoustic parameters.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. LANGUAGE SETTINGS */}
        <div className="rounded-3xl border border-white/10 bg-[#121118] p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Globe className="h-5 w-5 text-[#E98AE0]" />
            <span>Multilingual Speech &amp; Interface Language</span>
          </div>
          <p className="text-xs text-[#A7A7A7]">
            Select your preferred interaction language. Gnani / Vachana acoustic models optimize acoustic detection automatically for selected Indian locales.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <div
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? 'border-[#E98AE0] bg-[#160B24] font-bold text-white shadow-sm ring-1 ring-[#E98AE0]'
                      : 'border-white/10 hover:bg-[#160B24]/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">
                      {lang.flag} {lang.nativeLabel}
                    </span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-[#E98AE0]" />}
                  </div>
                  <span className="text-[11px] text-[#A7A7A7] block mt-1">
                    {lang.label} Speech STT &amp; TTS
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. AUDIO & SPEECH ENGINE */}
        <div className="rounded-3xl border border-white/10 bg-[#121118] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Volume2 className="h-5 w-5 text-[#E98AE0]" />
            <span>Voice &amp; Audio Parameters</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Speech Rate Slider */}
            <div>
              <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
                <span>Text-to-Speech Playback Speed</span>
                <span className="text-[#E98AE0]">{speechRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.4"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-[#E98AE0]"
              />
            </div>

            {/* Auto Play TTS Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div>
                <span className="font-bold text-white block">
                  Auto-Play Voice on Assistant Responses
                </span>
                <span className="text-[#A7A7A7] text-[11px]">
                  Automatically speak synthesized guidance when received from AI.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoPlayTts}
                onChange={(e) => setAutoPlayTts(e.target.checked)}
                className="h-5 w-5 rounded border-white/20 bg-[#080808] text-[#E98AE0] focus:ring-[#E98AE0] accent-[#E98AE0] cursor-pointer"
              />
            </div>

            {/* Low-Bandwidth PCM Streaming Mode */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div>
                <span className="font-bold text-white block">
                  16 kHz Low-Bandwidth PCM Mode
                </span>
                <span className="text-[#A7A7A7] text-[11px]">
                  Resamples microphone audio to 16kHz mono (512 samples/frame) for optimal 2G/3G connectivity.
                </span>
              </div>
              <input
                type="checkbox"
                checked={lowBandwidthMode}
                onChange={(e) => setLowBandwidthMode(e.target.checked)}
                className="h-5 w-5 rounded border-white/20 bg-[#080808] text-[#E98AE0] focus:ring-[#E98AE0] accent-[#E98AE0] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 3. HARDWARE & MICROPHONE TEST */}
        <div className="rounded-3xl border border-white/10 bg-[#121118] p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Mic className="h-5 w-5 text-[#E98AE0]" />
            <span>Microphone Diagnostic Test</span>
          </div>
          <p className="text-xs text-[#A7A7A7]">
            Verify your microphone gain and 16 kHz AudioStreamProcessor before beginning a live voice session.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={toggleTestMic}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer ${
                testMicActive
                  ? 'bg-rose-600 text-white'
                  : 'bg-gradient-to-r from-[#E98AE0] to-[#9333EA] text-black hover:opacity-90'
              }`}
            >
              {testMicActive ? 'Stop Mic Test' : 'Test Microphone Hardware'}
            </button>

            {testMicActive && (
              <div className="flex-1 w-full bg-[#090909] h-4 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className="bg-gradient-to-r from-[#E98AE0] to-[#9333EA] h-full rounded-full transition-all duration-75"
                  style={{ width: `${Math.min(100, testMicVolume * 1.5)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* 4. PRIVACY & DATA EXPORT */}
        <div className="rounded-3xl border border-white/10 bg-[#121118] p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Shield className="h-5 w-5 text-[#E98AE0]" />
            <span>Data Management &amp; Privacy</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <button
              onClick={exportData}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <Download className="h-4 w-4" /> Export My Career Data (JSON)
            </button>

            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E98AE0] to-[#9333EA] px-5 py-2 font-bold text-black hover:opacity-90 shadow-md shadow-pink-500/20 transition cursor-pointer"
            >
              <span>Save All Preferences</span>
            </button>
          </div>

          {savedSuccess && (
            <p className="text-xs font-bold text-[#E98AE0] flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Settings updated successfully!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
