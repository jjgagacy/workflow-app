import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { getSafeNumber } from "../helpers/safe-number";
import { DefaultConfigValues } from "../constants/default-config-value";

@Injectable()
export class FileUploadConfig {
  constructor(protected readonly configService: ConfigService
  ) { }

  uploadFileSizeLimit(): number {
    const limit = this.configService.get<number>('UPLOAD_FILE_SIZE_LIMIT', DefaultConfigValues.UPLOAD_FILE_SIZE_LIMIT);
    return getSafeNumber(limit, DefaultConfigValues.UPLOAD_FILE_SIZE_LIMIT);
  }

  uploadFileBatchLimit(): number {
    const limit = this.configService.get<number>('UPLOAD_FILE_BATCH_LIMIT', DefaultConfigValues.UPLOAD_FILE_BATCH_LIMIT);
    return getSafeNumber(limit, DefaultConfigValues.UPLOAD_FILE_BATCH_LIMIT);
  }

  uploadImageFileSizeLimit(): number {
    const limit = this.configService.get<number>('UPLOAD_IMAGE_FILE_SIZE_LIMIT', DefaultConfigValues.UPLOAD_IMAGE_FILE_SIZE_LIMIT);
    return getSafeNumber(limit, DefaultConfigValues.UPLOAD_IMAGE_FILE_SIZE_LIMIT);
  }

  uploadVideoFileSizeLimit(): number {
    const limit = this.configService.get<number>('UPLOAD_VIDEO_FILE_SIZE_LIMIT', DefaultConfigValues.UPLOAD_VIDEO_FILE_SIZE_LIMIT);
    return getSafeNumber(limit, DefaultConfigValues.UPLOAD_VIDEO_FILE_SIZE_LIMIT);
  }

  uploadAudioFileSizeLimit(): number {
    const limit = this.configService.get<number>('UPLOAD_AUDIO_FILE_SIZE_LIMIT', DefaultConfigValues.UPLOAD_AUDIO_FILE_SIZE_LIMIT);
    return getSafeNumber(limit, DefaultConfigValues.UPLOAD_AUDIO_FILE_SIZE_LIMIT);
  }

  batchUploadLimit(): number {
    const limit = this.configService.get<number>('BATCH_UPLOAD_LIMIT', DefaultConfigValues.BATCH_UPLOAD_LIMIT);
    return getSafeNumber(limit, DefaultConfigValues.BATCH_UPLOAD_LIMIT);
  }

  workflowFileUploadLimit(): number {
    const limit = this.configService.get<number>('WORKFLOW_FILE_UPLOAD_LIMIT', DefaultConfigValues.WORKFLOW_FILE_UPLOAD_LIMIT);
    return getSafeNumber(limit, DefaultConfigValues.WORKFLOW_FILE_UPLOAD_LIMIT);
  }

  fileSignatureSecretKey(): string {
    return this.configService.get<string>('FILE_SIGNATURE_SECRET_KEY', DefaultConfigValues.FILE_SIGNATURE_SECRET_KEY);
  }

  fileSignatureExpires(): number {
    const sec = this.configService.get<number>('FILE_SIGNATURE_EXPIRES', DefaultConfigValues.FILE_SIGNATURE_EXPIRES);
    return getSafeNumber(sec, DefaultConfigValues.FILE_SIGNATURE_EXPIRES);
  }
}
