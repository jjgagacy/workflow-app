"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PinkTTS = void 0;
const message_dto_1 = require("@/core/dtos/message.dto");
const endpoint_1 = require("@/interfaces/endpoint/endpoint");
const invoke_message_1 = require("@/interfaces/tool/invoke-message");
const crypto = __importStar(require("crypto"));
async function generateTTSAudio(text, options = {}) {
    const { voice = 'default', speed = 1.0, pitch = 1.0, format = 'mp3' } = options;
    const audioContent = `TTS audio: ${text}\nVoice: ${voice}\nFormat: ${format}`;
    return Buffer.from(audioContent, 'utf-8');
}
function getMimeType(format) {
    const mimeTypes = {
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'ogg': 'audio/ogg',
        'flac': 'audio/flac',
        'aac': 'audio/aac',
        'm4a': 'audio/mp4'
    };
    return mimeTypes[format.toLowerCase()] || 'application/octem-stream';
}
function generateFilename(text, format) {
    const hash = crypto.createHash('md5').update(text).digest('hex').substring(0, 8);
    const safeText = text
        .substring(0, 20)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();
    return `tts_${safeText}_${hash}.${format}`;
}
class PinkTTS extends endpoint_1.Endpoint {
    async invoke(request, values, settings) {
        try {
            const { text, voice = settings.voice || 'default', speed = settings.speed || 1.0, pitch = settings.pitch || 1.0, format = settings.format || 'mp3', streaming = settings.streaming || false } = this.extractParameters(request, values, settings);
            this.validateInput(text, voice, speed, pitch, format);
            const audioBuffer = await generateTTSAudio(text, {
                voice,
                speed: parseFloat(speed),
                pitch: parseFloat(pitch),
                format,
            });
            if (streaming && audioBuffer.length > 8192) {
                return this.createStreamingResponse(audioBuffer, text, format);
            }
            else {
                return this.createDirectResponse(audioBuffer, text, format);
            }
        }
        catch (error) {
            return this.createErrorResponse(error);
        }
    }
    createErrorResponse(error) {
        return invoke_message_1.ToolInvokeMessage.createText(`error: ${error.message}`);
    }
    createStreamingResponse(audioBuffer, text, format) {
        const mimeType = getMimeType(format);
        const filename = generateFilename(text, format);
        const blobId = crypto.randomUUID();
        const meta = {
            mimeType,
            filename,
            streaming: true,
        };
        return invoke_message_1.ToolInvokeMessage.createBlob(audioBuffer, { id: blobId, meta });
    }
    extractParameters(request, values, settings) {
        const text = values.text ||
            request.query?.text ||
            request.body?.text ||
            settings.text ||
            '';
        const voice = values.voice ||
            request.query?.voice ||
            request.body?.voice ||
            settings.voice ||
            'default';
        const speed = values.speed ||
            request.query?.speed ||
            request.body?.speed ||
            settings.speed ||
            1.0;
        const pitch = values.pitch ||
            request.query?.pitch ||
            request.body?.pitch ||
            settings.pitch ||
            1.0;
        const format = values.format ||
            request.query?.format ||
            request.body?.format ||
            settings.format ||
            'mp3';
        const streaming = values.streaming === 'true' ||
            request.query?.streaming === 'true' ||
            request.body?.streaming === 'true' ||
            settings.streaming === true ||
            false;
        return { text, voice, speed, pitch, format, streaming };
    }
    validateInput(text, voice, speed, pitch, format) {
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
    createDirectResponse(audioBuffer, text, format) {
        const mimeType = getMimeType(format);
        const filename = generateFilename(text, format);
        const payload = {
            type: message_dto_1.MessageType.BLOB,
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
        return new invoke_message_1.ToolInvokeMessage(payload);
    }
}
exports.PinkTTS = PinkTTS;
//# sourceMappingURL=tts.js.map