import { BlobMessagePayload, MessageType } from "@/core/dtos/message.dto.js";
import { Request } from "@/core/entities/endpoint/endpoint.entity.js";
import { Response } from "@/core/entities/endpoint/response.entity.js";
import { Endpoint } from "@/interfaces/endpoint/endpoint.js";
import { ToolInvokeMessage } from "@/interfaces/tool/invoke-message.js";
import * as crypto from 'crypto';

async function generateTTSAudio(text: string, options: {
  voice?: string;
  speed?: number;
  pitch?: number;
  format?: 'mp3' | 'wav' | 'ogg';
} = {}): Promise<Buffer> {
  const {
    voice = 'default',
    speed = 1.0,
    pitch = 1.0,
    format = 'mp3'
  } = options;

  const audioContent = `TTS audio: ${text}\nVoice: ${voice}\nFormat: ${format}`;
  return Buffer.from(audioContent, 'utf-8');
}

function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'flac': 'audio/flac',
    'aac': 'audio/aac',
    'm4a': 'audio/mp4'
  };
  return mimeTypes[format.toLowerCase()] || 'application/octem-stream';
}

function generateFilename(text: string, format: string): string {
  const hash = crypto.createHash('md5').update(text).digest('hex').substring(0, 8);
  const safeText = text
    .substring(0, 20)
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase();
  return `tts_${safeText}_${hash}.${format}`;
}

export class PinkTTS extends Endpoint {
  async invoke(request: Request, values: Record<string, any>, settings: Record<string, any>): Promise<Response> {
    try {
      const {
        text,
        voice = settings.voice || 'default',
        speed = settings.speed || 1.0,
        pitch = settings.pitch || 1.0,
        format = settings.format || 'mp3',
        streaming = settings.streaming || false
      } = this.extractParameters(request, values, settings);

      this.validateInput(text, voice, speed, pitch, format);

      const audioBuffer = await generateTTSAudio(text, {
        voice,
        speed: parseFloat(speed),
        pitch: parseFloat(pitch),
        format,
      });

      if (streaming && audioBuffer.length > 8192) {
        return this.createStreamingResponse(audioBuffer, text, format);
      } else {
        return this.createDirectResponse(audioBuffer, text, format);
      }
    } catch (error: any) {
      return this.createErrorResponse(error);
    }
  }

  private createErrorResponse(error: Error): Response {
    return ToolInvokeMessage.createText(`error: ${error.message}`);
  }

  private createStreamingResponse(
    audioBuffer: Buffer,
    text: string,
    format: string,
  ): Response {
    const mimeType = getMimeType(format);
    const filename = generateFilename(text, format);
    const blobId = crypto.randomUUID();
    const meta = {
      mimeType,
      filename,
      streaming: true,
    };

    return ToolInvokeMessage.createBlob(audioBuffer, { id: blobId, meta });
  }

  private extractParameters(
    request: Request,
    values: Record<string, any>,
    settings: Record<string, any>
  ): {
    text: string;
    voice: string;
    speed: number | string;
    pitch: number | string;
    format: string;
    streaming: boolean;
  } {
    const text =
      values.text ||
      request.query?.text ||
      request.body?.text ||
      settings.text ||
      '';
    const voice =
      values.voice ||
      request.query?.voice ||
      request.body?.voice ||
      settings.voice ||
      'default';

    const speed =
      values.speed ||
      request.query?.speed ||
      request.body?.speed ||
      settings.speed ||
      1.0;

    const pitch =
      values.pitch ||
      request.query?.pitch ||
      request.body?.pitch ||
      settings.pitch ||
      1.0;

    const format =
      values.format ||
      request.query?.format ||
      request.body?.format ||
      settings.format ||
      'mp3';

    const streaming =
      values.streaming === 'true' ||
      request.query?.streaming === 'true' ||
      request.body?.streaming === 'true' ||
      settings.streaming === true ||
      false;

    return { text, voice, speed, pitch, format, streaming };
  }

  private validateInput(
    text: string,
    voice: string,
    speed: number | string,
    pitch: number | string,
    format: string
  ): void {
    if (!text || text.trim().length === 0) {
      throw new Error('Text parameter is empty');
    }

    if (text.length > 5000) {
      throw new Error(`Text length exceeds maximum limit of 5000 characters`);
    }

    const speedNum = parseFloat(speed.toString());
    if (isNaN(speedNum) || speedNum < 0.5 || speedNum > 2.0) {
      throw new Error('Speed must be a number between 0.5 and 2.0');
    }

    const pitchNum = parseFloat(pitch.toString());
    if (isNaN(pitchNum) || pitchNum < 0.5 || pitchNum > 2.0) {
      throw new Error('Pitch must be a number between 0.5 and 2.0');
    }

    const validFormats = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'];
    if (!validFormats.includes(format.toLowerCase())) {
      throw new Error(`Invalid format. Supported formats: ${validFormats.join(', ')}`);
    }
  }

  private createDirectResponse(
    audioBuffer: Buffer,
    text: string,
    format: string
  ): Response {
    const mimeType = getMimeType(format);
    const filename = generateFilename(text, format);

    const payload: BlobMessagePayload = {
      type: MessageType.BLOB,
      message: { blob: audioBuffer },
      meta: {
        mimeType,
        filename,
        textLength: text.length,
        audioFormat: format,
        audioSize: audioBuffer.length,
        generatedAt: new Date().toISOString(),
      }
    };
    return new ToolInvokeMessage(payload);
  }


}
