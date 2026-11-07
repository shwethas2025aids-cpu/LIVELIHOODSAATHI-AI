/**
 * AudioStreamProcessor for LivelihoodSaathi AI
 * Complies with Gnani / Vachana STT requirements:
 * - 16 kHz sample rate
 * - Signed 16-bit little-endian PCM (Int16)
 * - Mono audio
 * - 512 samples per frame (1024 bytes)
 * - ~32ms per frame transmission
 */

export interface AudioProcessorOptions {
  sampleRate?: number; // Target: 16000
  samplesPerFrame?: number; // Target: 512
  onAudioFrame: (frame: ArrayBuffer) => void;
  onVolumeChange?: (volume: number) => void;
  onError?: (error: Error) => void;
}

export class AudioStreamProcessor {
  private targetSampleRate: number;
  private samplesPerFrame: number;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private onAudioFrame: (frame: ArrayBuffer) => void;
  private onVolumeChange?: (volume: number) => void;
  private onError?: (error: Error) => void;
  private pcmBuffer: Float32Array = new Float32Array(0);
  private isRunning: boolean = false;

  constructor(options: AudioProcessorOptions) {
    this.targetSampleRate = options.sampleRate || 16000;
    this.samplesPerFrame = options.samplesPerFrame || 512;
    this.onAudioFrame = options.onAudioFrame;
    this.onVolumeChange = options.onVolumeChange;
    this.onError = options.onError;
  }

  /**
   * Request microphone access and begin 16kHz PCM streaming
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser.');
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Buffer size: 2048 or 4096 gives smooth processing chunks
      const bufferSize = 2048;
      this.processorNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

      this.pcmBuffer = new Float32Array(0);

      this.processorNode.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!this.isRunning) return;

        const inputChannelData = e.inputBuffer.getChannelData(0);
        const inputSampleRate = e.inputBuffer.sampleRate;

        // Calculate volume / RMS for visualizer
        if (this.onVolumeChange) {
          let sumSquares = 0;
          for (let i = 0; i < inputChannelData.length; i++) {
            sumSquares += inputChannelData[i] * inputChannelData[i];
          }
          const rms = Math.sqrt(sumSquares / inputChannelData.length);
          // Scale to 0..100
          const level = Math.min(100, Math.round(rms * 250));
          this.onVolumeChange(level);
        }

        // Resample inputChannelData from inputSampleRate down to targetSampleRate (16000)
        const resampled = this.resampleAudio(inputChannelData, inputSampleRate, this.targetSampleRate);

        // Append to accumulation buffer
        const nextBuffer = new Float32Array(this.pcmBuffer.length + resampled.length);
        nextBuffer.set(this.pcmBuffer);
        nextBuffer.set(resampled, this.pcmBuffer.length);
        this.pcmBuffer = nextBuffer;

        // Emit chunks of exact frame size (512 samples = 1024 bytes)
        while (this.pcmBuffer.length >= this.samplesPerFrame) {
          const frameSamples = this.pcmBuffer.subarray(0, this.samplesPerFrame);
          this.pcmBuffer = this.pcmBuffer.subarray(this.samplesPerFrame);

          const pcm16Buffer = this.floatTo16BitPCM(frameSamples);
          this.onAudioFrame(pcm16Buffer);
        }
      };

      // Connect to a muted gain node to prevent speaker feedback while keeping processor active
      const muteGain = this.audioContext.createGain();
      muteGain.gain.value = 0;

      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(muteGain);
      muteGain.connect(this.audioContext.destination);
      this.isRunning = true;
    } catch (err: unknown) {
      this.stop();
      const error = err instanceof Error ? err : new Error(String(err));
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * Linear resampling helper
   */
  private resampleAudio(
    audioData: Float32Array,
    sourceRate: number,
    targetRate: number
  ): Float32Array {
    if (sourceRate === targetRate) {
      return audioData;
    }
    const ratio = sourceRate / targetRate;
    const newLength = Math.round(audioData.length / ratio);
    const result = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const originalIndex = i * ratio;
      const indexFloor = Math.floor(originalIndex);
      const indexCeil = Math.min(audioData.length - 1, Math.ceil(originalIndex));
      const fraction = originalIndex - indexFloor;
      result[i] = audioData[indexFloor] * (1 - fraction) + audioData[indexCeil] * fraction;
    }

    return result;
  }

  /**
   * Convert Float32Array (-1.0 to +1.0) into 16-bit Little Endian Signed PCM
   */
  private floatTo16BitPCM(input: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);

    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      // Convert to signed 16-bit integer: -32768 to 32767
      const val = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(i * 2, val, true); // true = little-endian
    }

    return buffer;
  }

  /**
   * Stop recording and clean up all media streams and audio contexts
   */
  stop(): void {
    this.isRunning = false;

    if (this.processorNode) {
      try {
        this.processorNode.disconnect();
      } catch {
        // ignore
      }
      this.processorNode = null;
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {
        // ignore
      }
      this.sourceNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {
        // ignore
      }
      this.audioContext = null;
    }

    if (this.onVolumeChange) {
      this.onVolumeChange(0);
    }
    this.pcmBuffer = new Float32Array(0);
  }

  /**
   * Check if recording is active
   */
  get active(): boolean {
    return this.isRunning;
  }
}
