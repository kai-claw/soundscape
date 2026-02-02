export class AudioEngine {
  public ctx: AudioContext | null = null;
  public analyser: AnalyserNode | null = null;
  public source: MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null = null;
  public audioElement: HTMLAudioElement | null = null;

  private freqData: Uint8Array<ArrayBuffer> = new Uint8Array(0);
  private timeData: Uint8Array<ArrayBuffer> = new Uint8Array(0);
  private stream: MediaStream | null = null;
  private fftSize = 2048;
  private objectUrl: string | null = null;

  /** Check browser support before attempting to use audio features */
  static checkSupport(): { audio: boolean; mic: boolean; webgl: boolean } {
    return {
      audio: typeof AudioContext !== 'undefined' || typeof (window as unknown as Record<string, unknown>).webkitAudioContext !== 'undefined',
      mic: !!(navigator.mediaDevices?.getUserMedia),
      webgl: (() => {
        try {
          const c = document.createElement('canvas');
          return !!(c.getContext('webgl2') || c.getContext('webgl'));
        } catch {
          return false;
        }
      })(),
    };
  }

  /** Callback invoked when the microphone stream track ends (e.g. Bluetooth disconnect) */
  public onMicDisconnect: (() => void) | null = null;

  async init() {
    if (this.ctx) {
      // Resume suspended context (browser policy after tab backgrounding)
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }
    this.ensureContext();
  }

  /** Resume AudioContext if suspended (call on user interaction) */
  async resume() {
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  async connectMic() {
    await this.init();
    this.disconnect();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.source = this.ctx!.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser!);

      // Handle mic disconnection (e.g. Bluetooth headset removed)
      const track = this.stream.getAudioTracks()[0];
      if (track) {
        track.addEventListener('ended', () => {
          console.warn('[SoundScape] Microphone track ended (device disconnected?)');
          this.disconnect();
          this.onMicDisconnect?.();
        }, { once: true });
      }
    } catch (e) {
      console.error('Mic access denied:', e);
      throw e;
    }
  }

  /** Callback invoked when file playback encounters an error */
  public onFileError: ((message: string) => void) | null = null;

  connectFile(file: File): HTMLAudioElement {
    this.disconnect();

    // Revoke previous blob URL to prevent memory leak
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }

    this.objectUrl = URL.createObjectURL(file);
    this.audioElement = new Audio(this.objectUrl);
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.loop = true;

    // Handle decode/playback errors (corrupt files, unsupported codecs)
    this.audioElement.addEventListener('error', () => {
      const code = this.audioElement?.error?.code;
      const messages: Record<number, string> = {
        1: 'Playback was aborted.',
        2: 'A network error occurred while loading the audio.',
        3: 'Could not decode the audio file. It may be corrupted or in an unsupported format.',
        4: 'Audio format is not supported by your browser.',
      };
      const msg = messages[code ?? 0] ?? 'An unknown audio error occurred.';
      console.error('[SoundScape] Audio element error:', msg, this.audioElement?.error);
      this.onFileError?.(msg);
    }, { once: true });

    // Reuse shared init logic instead of duplicating AudioContext creation
    this.ensureContext();

    // Resume suspended AudioContext (browser autoplay policy)
    if (this.ctx!.state === 'suspended') {
      this.ctx!.resume().catch(() => {
        console.warn('[SoundScape] Could not resume AudioContext for file playback');
      });
    }

    this.source = this.ctx!.createMediaElementSource(this.audioElement);
    this.source.connect(this.analyser!);
    this.analyser!.connect(this.ctx!.destination);
    this.audioElement.play().catch((err) => {
      console.error('[SoundScape] Audio play failed:', err);
      this.onFileError?.('Could not start audio playback. Please try again.');
    });
    return this.audioElement;
  }

  /** Ensure AudioContext + AnalyserNode exist (idempotent) */
  private ensureContext() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (!this.analyser) {
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = this.fftSize;
      this.analyser.smoothingTimeConstant = 0.8;
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeData = new Uint8Array(this.analyser.fftSize);
    }
  }

  disconnect() {
    if (this.source) {
      try {
        this.source.disconnect();
      } catch {
        // Already disconnected
      }
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }
    // Revoke blob URL on disconnect
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  getFrequencyData(): Uint8Array {
    if (!this.analyser) return this.freqData;
    this.analyser.getByteFrequencyData(this.freqData);
    return this.freqData;
  }

  getTimeDomainData(): Uint8Array {
    if (!this.analyser) return this.timeData;
    this.analyser.getByteTimeDomainData(this.timeData);
    return this.timeData;
  }

  getAverageLevel(): number {
    const data = this.getFrequencyData();
    if (data.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    return sum / data.length / 255;
  }

  getBandLevels(): { bass: number; mid: number; high: number } {
    const data = this.freqData;
    const len = data.length;
    if (len === 0) return { bass: 0, mid: 0, high: 0 };

    const bassEnd = Math.max(1, Math.floor(len * 0.1));
    const midEnd = Math.max(bassEnd + 1, Math.floor(len * 0.5));

    let bass = 0, mid = 0, high = 0;
    for (let i = 0; i < bassEnd; i++) bass += data[i];
    for (let i = bassEnd; i < midEnd; i++) mid += data[i];
    for (let i = midEnd; i < len; i++) high += data[i];

    const bassCount = bassEnd;
    const midCount = midEnd - bassEnd;
    const highCount = len - midEnd;

    bass = bassCount > 0 ? bass / (bassCount * 255) : 0;
    mid = midCount > 0 ? mid / (midCount * 255) : 0;
    high = highCount > 0 ? high / (highCount * 255) : 0;

    return { bass, mid, high };
  }

  /** Check if audio is actively flowing (non-silent) */
  isReceivingAudio(): boolean {
    if (!this.analyser) return false;
    // Check if frequency data has any non-zero values
    const data = this.freqData;
    for (let i = 0; i < data.length; i++) {
      if (data[i] > 2) return true; // threshold above noise floor
    }
    return false;
  }

  destroy() {
    this.disconnect();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
      this.analyser = null;
    }
  }
}

export const audioEngine = new AudioEngine();
