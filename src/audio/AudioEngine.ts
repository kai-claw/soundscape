export class AudioEngine {
  public ctx: AudioContext | null = null;
  public analyser: AnalyserNode | null = null;
  public source: MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null = null;
  public audioElement: HTMLAudioElement | null = null;

  private freqData: Uint8Array<ArrayBuffer> = new Uint8Array(0);
  private timeData: Uint8Array<ArrayBuffer> = new Uint8Array(0);
  private stream: MediaStream | null = null;
  private fftSize = 2048;

  async init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = this.fftSize;
    this.analyser.smoothingTimeConstant = 0.8;
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.fftSize);
  }

  async connectMic() {
    await this.init();
    this.disconnect();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.source = this.ctx!.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser!);
    } catch (e) {
      console.error('Mic access denied:', e);
      throw e;
    }
  }

  connectFile(file: File): HTMLAudioElement {
    this.disconnect();
    const url = URL.createObjectURL(file);
    this.audioElement = new Audio(url);
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.loop = true;

    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = this.fftSize;
      this.analyser.smoothingTimeConstant = 0.8;
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeData = new Uint8Array(this.analyser.fftSize);
    }

    this.source = this.ctx.createMediaElementSource(this.audioElement);
    this.source.connect(this.analyser!);
    this.analyser!.connect(this.ctx.destination);
    this.audioElement.play();
    return this.audioElement;
  }

  disconnect() {
    if (this.source) {
      this.source.disconnect();
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

    const bassEnd = Math.floor(len * 0.1);
    const midEnd = Math.floor(len * 0.5);

    let bass = 0, mid = 0, high = 0;
    for (let i = 0; i < bassEnd; i++) bass += data[i];
    for (let i = bassEnd; i < midEnd; i++) mid += data[i];
    for (let i = midEnd; i < len; i++) high += data[i];

    bass /= bassEnd * 255;
    mid /= (midEnd - bassEnd) * 255;
    high /= (len - midEnd) * 255;

    return { bass, mid, high };
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
