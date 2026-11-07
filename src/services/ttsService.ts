/**
 * Text-to-Speech service for LivelihoodSaathi AI
 * Manages low-latency audio playback, immediate stop, pause, resume, and clean multilingual speech synthesis.
 */

type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

interface TTSListener {
  onStateChange: (state: PlaybackState) => void;
  onError?: (err: Error) => void;
}

/**
 * Clean markdown, emojis, code blocks, and symbols before feeding into speech synthesis
 */
export function cleanTextForSpeech(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/[*#_~`>]/g, '') // remove markdown symbols
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // replace markdown links with link text
    .replace(/•/g, '')
    .replace(/&amp;/g, 'and')
    .replace(/(\d+)\.\s+/g, '$1, ') // convert numbered list to natural pauses
    .replace(/:\s+/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '. ')
    .trim();
}

class TTSService {
  private audioElement: HTMLAudioElement | null = null;
  private currentObjectUrl: string | null = null;
  private state: PlaybackState = 'idle';
  private listeners: Set<TTSListener> = new Set();
  private isBrowserSpeech: boolean = false;
  private keepAliveTimer: NodeJS.Timeout | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  // Robust client-controlled sentence queue for instant stoppage on Stop button
  private sentenceQueue: string[] = [];
  private isStopped: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.addEventListener('playing', () => this.setState('playing'));
      this.audioElement.addEventListener('pause', () => {
        if (this.state === 'playing') this.setState('paused');
      });
      this.audioElement.addEventListener('ended', () => {
        this.cleanupObjectUrl();
        this.setState('idle');
      });
      this.audioElement.addEventListener('error', (e) => {
        console.warn('Audio playback notice:', e);
        this.setState('error');
      });

      // Preload available browser voices
      if ('speechSynthesis' in window) {
        this.loadVoices();
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public loadVoices(): SpeechSynthesisVoice[] {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const v = window.speechSynthesis.getVoices() || [];
      if (v.length > 0) {
        this.cachedVoices = v;
      }
      return this.cachedVoices;
    }
    return [];
  }

  private setState(newState: PlaybackState) {
    this.state = newState;
    this.listeners.forEach((l) => l.onStateChange(newState));
  }

  private cleanupObjectUrl() {
    if (this.currentObjectUrl) {
      try {
        URL.revokeObjectURL(this.currentObjectUrl);
      } catch {
        // ignore
      }
      this.currentObjectUrl = null;
    }
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  subscribe(listener: TTSListener): () => void {
    this.listeners.add(listener);
    listener.onStateChange(this.state);
    return () => this.listeners.delete(listener);
  }

  /**
   * Find best matching voice with authentic Indian locale phonetics
   */
  public getBestVoice(language: string): SpeechSynthesisVoice | null {
    if (this.cachedVoices.length === 0) {
      this.loadVoices();
    }
    const voices = this.cachedVoices;
    if (!voices || voices.length === 0) return null;

    const langLower = (language || 'ta-IN').toLowerCase();
    const isTamil = langLower.startsWith('ta') && langLower !== 'ta-en';
    const isTanglish = langLower === 'ta-en';
    const isHindi = langLower.startsWith('hi');

    if (isTanglish) {
      // For Tanglish, Indian English voices pronounce Latinized Tamil phonemes with authentic Indian cadence
      const inVoice = voices.find(
        (v) =>
          v.lang.toLowerCase() === 'en-in' ||
          v.name.toLowerCase().includes('india') ||
          v.name.toLowerCase().includes('neerja') ||
          v.name.toLowerCase().includes('prabhat') ||
          v.name.toLowerCase().includes('ravi')
      );
      if (inVoice) return inVoice;
    }

    if (isTamil) {
      // 1. Check for Tamil voice (e.g. Google தமிழ், Microsoft Valluvar)
      const taVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('ta') ||
          v.name.toLowerCase().includes('tamil') ||
          v.name.toLowerCase().includes('valluvar')
      );
      if (taVoice) return taVoice;

      // 2. Fall back to Indian English voice for Indian phonetics
      const inVoice = voices.find(
        (v) =>
          v.lang.toLowerCase() === 'en-in' ||
          v.name.toLowerCase().includes('india') ||
          v.name.toLowerCase().includes('neerja')
      );
      if (inVoice) return inVoice;
    }

    if (isHindi) {
      // 1. Check for Hindi voice (e.g. Google हिन्दी, Microsoft Hemant, Microsoft Kalpana)
      const hiVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('hi') ||
          v.name.toLowerCase().includes('hindi') ||
          v.name.toLowerCase().includes('hemant') ||
          v.name.toLowerCase().includes('kalpana')
      );
      if (hiVoice) return hiVoice;

      // 2. Fall back to Indian English voice
      const inVoice = voices.find(
        (v) =>
          v.lang.toLowerCase() === 'en-in' ||
          v.name.toLowerCase().includes('india')
      );
      if (inVoice) return inVoice;
    }

    // Default: Check Indian English voice
    const indianVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === 'en-in' ||
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('neerja')
    );
    if (indianVoice) return indianVoice;

    // Any English voice
    const enVoice = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
    if (enVoice) return enVoice;

    return voices[0] || null;
  }

  /**
   * Internal player for next sentence in queue
   */
  private playNextSentence(lang: string, voice: SpeechSynthesisVoice | null): void {
    if (this.isStopped || this.sentenceQueue.length === 0) {
      this.isBrowserSpeech = false;
      if (this.keepAliveTimer) {
        clearInterval(this.keepAliveTimer);
        this.keepAliveTimer = null;
      }
      this.currentUtterance = null;
      this.setState('idle');
      return;
    }

    const nextSentence = this.sentenceQueue.shift();
    if (!nextSentence || !nextSentence.trim()) {
      this.playNextSentence(lang, voice);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(nextSentence);
      this.currentUtterance = utterance;

      const langLower = (lang || 'ta-IN').toLowerCase();
      const isTanglish = langLower === 'ta-en';
      const containsTamilChars = /[\u0B80-\u0BFF]/.test(nextSentence);
      const containsHindiChars = /[\u0900-\u097F]/.test(nextSentence);

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        if (isTanglish) {
          utterance.lang = 'en-IN';
        } else if (containsTamilChars) {
          utterance.lang = 'ta-IN';
        } else if (containsHindiChars) {
          utterance.lang = 'hi-IN';
        } else {
          utterance.lang = 'en-IN';
        }
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        if (!this.isStopped) {
          this.setState('playing');
        }
      };

      utterance.onend = () => {
        if (!this.isStopped) {
          this.playNextSentence(lang, voice);
        }
      };

      utterance.onerror = (e) => {
        // If canceled by Stop button, terminate sentence queue immediately
        if (e.error === 'canceled' || this.isStopped) {
          this.sentenceQueue = [];
          this.isBrowserSpeech = false;
          if (this.keepAliveTimer) {
            clearInterval(this.keepAliveTimer);
            this.keepAliveTimer = null;
          }
          this.setState('idle');
          return;
        }
        if (!this.isStopped) {
          this.playNextSentence(lang, voice);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Utterance speech error:', err);
      if (!this.isStopped) {
        this.playNextSentence(lang, voice);
      }
    }
  }

  /**
   * Low-Latency Audio Playback with Sentence Queueing
   */
  async play(text: string, language: string = 'ta-IN', audioUrl?: string): Promise<void> {
    // Stop any existing playback first
    this.stop();
    this.isStopped = false;
    this.setState('loading');

    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) {
      this.setState('idle');
      return;
    }

    // 1. If explicit audioUrl is provided, play directly via HTML5 Audio
    if (audioUrl && this.audioElement) {
      try {
        this.audioElement.src = audioUrl;
        await this.audioElement.play();
        return;
      } catch (err) {
        console.warn('Direct audioUrl playback notice:', err);
      }
    }

    // 2. Client Web Speech Synthesis with Queue
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const bestVoice = this.getBestVoice(language);

        // Break response into natural sentence units for immediate playback start
        const rawSentences = cleanText
          .split(/(?<=[.!?।\n])\s+/)
          .map((s) => s.trim())
          .filter(Boolean);

        const sentences = rawSentences.length > 0 ? rawSentences : [cleanText];
        this.sentenceQueue = [...sentences];
        this.isBrowserSpeech = true;
        this.setState('playing');

        // Setup keep-alive timer for Chromium
        if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
        this.keepAliveTimer = setInterval(() => {
          if (!this.isStopped && window.speechSynthesis && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 5000);

        this.playNextSentence(language, bestVoice);
        return;
      } catch (speechErr) {
        console.warn('Web Speech synthesis error, trying backend route:', speechErr);
      }
    }

    // 3. Backend fallback (/api/tts/synthesize)
    try {
      const res = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, language }),
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('audio') || contentType.includes('application/octet-stream')) {
          const blob = await res.blob();
          this.currentObjectUrl = URL.createObjectURL(blob);
          if (this.audioElement && !this.isStopped) {
            this.audioElement.src = this.currentObjectUrl;
            await this.audioElement.play();
            return;
          }
        }
      }
      this.setState('idle');
    } catch {
      this.setState('error');
    }
  }

  pause(): void {
    if (this.isBrowserSpeech && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      this.setState('paused');
    } else if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
      this.setState('paused');
    }
  }

  resume(): void {
    if (this.isBrowserSpeech && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      this.setState('playing');
    } else if (this.audioElement && this.audioElement.paused) {
      this.audioElement.play().catch(() => this.setState('error'));
    }
  }

  /**
   * Immediately stops all voice output, cancels browser synthesis, empties sentence queue,
   * resets audio element, and drops state back to idle.
   */
  stop(): void {
    this.isStopped = true;
    this.sentenceQueue = [];

    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.pause();
          window.speechSynthesis.cancel();
        }
      } catch (err) {
        console.warn('SpeechSynthesis cancel notice:', err);
      }
      this.isBrowserSpeech = false;
    }

    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.audioElement.src = '';
      } catch {
        // ignore
      }
    }

    this.currentUtterance = null;
    this.cleanupObjectUrl();
    this.setState('idle');
  }

  getState(): PlaybackState {
    return this.state;
  }
}

export const ttsService = new TTSService();
