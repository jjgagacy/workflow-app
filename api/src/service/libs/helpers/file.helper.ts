import { FILE_CONSTANTS } from "@/config/file.constants";
import { I18nTranslations } from "@/generated/i18n.generated";
import { InvalidFilenameError } from "@/service/exceptions/file.error";
import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import path from "path";
import * as crypto from 'crypto';
import { MonieConfig } from "@/monie/monie.config";

export interface FileSignature {
  timestamp: string;
  nonce: string;
  sign: string;
}

@Injectable()
export class FileHelper {
  constructor(
    private readonly monieConfig: MonieConfig,
    private readonly i18n: I18nService<I18nTranslations>,
  ) { }

  validateFilename(filename: string): string {
    const { INVALID_CHARS, MAX_FILENAME_LENGTH } = FILE_CONSTANTS;

    if (INVALID_CHARS.some(char => filename.includes(char))) {
      throw InvalidFilenameError.create(this.i18n);
    }

    if (filename.length > MAX_FILENAME_LENGTH) {
      const extension = this.extractFileExtension(filename);
      const nameWithoutExtension = filename.slice(0, -extension.length - 1);
      const truncatedName = nameWithoutExtension.slice(0, MAX_FILENAME_LENGTH - extension.length - 1);
      return `${truncatedName}.${extension}`;
    }

    return filename;
  }

  extractFileExtension(filename: string): string {
    const ext = path.extname(filename);
    return ext ? ext.slice(1) : '';
  }

  generateFileSignature(fileId: string): FileSignature {
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString('hex');

    const stringToSign = `${fileId}:${timestamp}:${nonce}`;
    const sign = crypto
      .createHmac('sha256', this.monieConfig.fileSignatureSecretKey())
      .update(stringToSign)
      .digest('hex');
    return { timestamp, nonce, sign };
  }

  verifyFileSignature(fileId: string, timestamp: string, nonce: string, sign: string): boolean {
    const now = Date.now();
    const signatureTime = parseInt(timestamp, 10);
    if (now - signatureTime > this.monieConfig.fileSignatureExpires()) {
      return false;
    }

    const stringToSign = `${fileId}:${timestamp}:${nonce}`;
    const expectedSign = crypto
      .createHmac('sha256', this.monieConfig.fileSignatureSecretKey())
      .update(stringToSign)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSign, 'hex'),
      Buffer.from(sign, 'hex')
    );
  }

  getSignedFileUrl(fileId: string): string {
    const signature = this.generateFileSignature(fileId);
    const baseUrl = this.monieConfig.filesUrl() || 'http://localhost:3001';

    return `${baseUrl}/files/preview/${fileId}?` +
      `timestamp=${signature.timestamp}&` +
      `nonce=${signature.nonce}&` +
      `sign=${signature.sign}`;
  }
}
