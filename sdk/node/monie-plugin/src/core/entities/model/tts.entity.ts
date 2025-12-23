export interface TTSVoice {
  name: string;
  value?: string;
  mode?: string;
  language?: string;
}

export interface TTSTextSentence {
  text: string;
  index: number;
}

export class TTSResult {
  audio: Buffer | Uint8Array;
  audioType?: string;
  filename?: string;
  metadata?: Record<string, any>;

  constructor(data: Partial<TTSResult> = {}) {
    this.audio = data.audio || Buffer.from([]);
    this.audioType = data.audioType || '';
    this.filename = data.filename || ''
    this.metadata = data.metadata || {};
  }
}