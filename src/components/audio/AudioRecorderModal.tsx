'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Upload,
  Play,
  RotateCcw,
  Sparkles,
  X,
  FileAudio,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';

interface AudioRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptSubmitted: (transcript: string) => void;
}

export const AudioRecorderModal: React.FC<AudioRecorderModalProps> = ({
  isOpen,
  onClose,
  onTranscriptSubmitted,
}) => {
  const { currentLanguage } = useLanguage();

  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedLang, setDetectedLang] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [audioUrl]);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      setError(null);
      setTranscript('');
      setAudioBlob(null);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Microphone permission denied: ${msg}`);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError('Audio file exceeds 15 MB limit.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(URL.createObjectURL(file));
  };

  const handleTranscribe = async () => {
    const payload = activeTab === 'record' ? audioBlob : selectedFile;
    if (!payload) return;

    try {
      setIsTranscribing(true);
      setError(null);

      const res = await apiService.transcribeAudioFile(payload, currentLanguage);
      setTranscript(res.text);
      setDetectedLang(res.detected_language);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Transcription error: ${msg}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSendToAI = () => {
    if (!transcript.trim()) return;
    onTranscriptSubmitted(transcript);
    onClose();
  };

  const resetAll = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setSelectedFile(null);
    setTranscript('');
    setError(null);
    setRecordingDuration(0);
    if (isRecording) stopRecording();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-[#121118] border border-white/15 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#160B24] px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#090909] border border-[#E98AE0]/30 text-[#E98AE0]">
              <FileAudio className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Audio Speech-to-Text</h3>
              <p className="text-[11px] text-[#A7A7A7]">Record or upload audio file for REST transcription</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetAll();
              onClose();
            }}
            className="rounded-lg p-1.5 text-[#A7A7A7] hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-white/10 bg-[#090909]">
          <button
            onClick={() => {
              setActiveTab('record');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold text-center transition border-b-2 cursor-pointer ${
              activeTab === 'record'
                ? 'border-[#E98AE0] text-[#E98AE0] bg-[#160B24]'
                : 'border-transparent text-[#A7A7A7] hover:text-white'
            }`}
          >
            Record Audio
          </button>
          <button
            onClick={() => {
              setActiveTab('upload');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold text-center transition border-b-2 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#E98AE0] text-[#E98AE0] bg-[#160B24]'
                : 'border-transparent text-[#A7A7A7] hover:text-white'
            }`}
          >
            Upload Audio File
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeTab === 'record' ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-4 rounded-2xl border border-dashed border-white/15 bg-[#090909]">
              <div className="relative">
                {isRecording && (
                  <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                )}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`relative flex h-16 w-16 items-center justify-center rounded-full text-black shadow-lg transition-transform hover:scale-105 cursor-pointer ${
                    isRecording ? 'bg-rose-600 text-white ring-4 ring-rose-500/30' : 'bg-gradient-to-r from-[#E98AE0] to-[#9333EA] text-black ring-4 ring-[#E98AE0]/30'
                  }`}
                >
                  {isRecording ? <Square className="h-6 w-6 fill-current text-white" /> : <Mic className="h-7 w-7 text-black" />}
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs font-bold text-white">
                  {isRecording ? `Recording... 00:${recordingDuration.toString().padStart(2, '0')}` : 'Click to start recording'}
                </p>
                <p className="text-[11px] text-[#A7A7A7]">
                  {isRecording ? 'Speak your career or training query' : 'Audio will be captured and formatted'}
                </p>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center py-8 rounded-2xl border-2 border-dashed border-white/15 bg-[#090909] hover:bg-[#160B24]/40 cursor-pointer transition"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="h-8 w-8 text-[#E98AE0] mb-2" />
              <p className="text-xs font-bold text-white">
                {selectedFile ? selectedFile.name : 'Click to select audio file'}
              </p>
              <p className="text-[11px] text-[#A7A7A7] mt-1">
                Supports WAV, MP3, M4A, OGG (Up to 15MB)
              </p>
            </div>
          )}

          {/* Audio Preview Player */}
          {audioUrl && (
            <div className="rounded-xl border border-white/10 bg-[#090909] p-3 space-y-2">
              <span className="text-[11px] font-semibold text-white">Audio Preview:</span>
              <audio controls src={audioUrl} className="w-full h-8" />
            </div>
          )}

          {/* Transcribe Trigger Button */}
          {(audioBlob || selectedFile) && !transcript && (
            <button
              disabled={isTranscribing}
              onClick={handleTranscribe}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E98AE0] to-[#9333EA] py-2.5 text-xs font-bold text-black shadow-lg shadow-pink-500/20 hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-black" /> Processing via Gnani STT Proxy...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-black" /> Transcribe Audio
                </>
              )}
            </button>
          )}

          {/* Editable Transcript Display */}
          {transcript && (
            <div className="rounded-2xl border border-white/10 bg-[#160B24] p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#E98AE0] flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#E98AE0]" /> Transcription Result:
                </span>
                {detectedLang && (
                  <span className="rounded bg-[#090909] border border-[#E98AE0]/30 px-2 py-0.5 text-[10px] font-bold text-[#E98AE0]">
                    Language: {detectedLang}
                  </span>
                )}
              </div>

              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-white/15 bg-[#080808] p-2.5 text-xs text-white placeholder-[#A7A7A7] focus:outline-none focus:ring-1 focus:ring-[#E98AE0]"
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={resetAll}
                  className="rounded-xl px-2.5 py-1 text-xs text-[#A7A7A7] hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  Clear
                </button>
                <button
                  onClick={handleSendToAI}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E98AE0] to-[#9333EA] px-3.5 py-1.5 text-xs font-bold text-black shadow hover:opacity-90 transition cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-black" /> Submit to Career AI
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 p-2.5 text-xs text-rose-300 border border-rose-500/30">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
