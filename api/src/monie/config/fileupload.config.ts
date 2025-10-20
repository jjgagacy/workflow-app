import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { getSafeNumber } from "../helpers/safe-number";
import { defaultConfigValues } from "../constants/default-config-value";

@Injectable()
export class FileUploadConfig {
    constructor(protected readonly configService: ConfigService
    ) { }

    uploadFileSizeLimit(): number {
        const limit = this.configService.get<number>('UPLOAD_FILE_SIZE_LIMIT', defaultConfigValues.UPLOAD_FILE_SIZE_LIMIT);
        return getSafeNumber(limit, defaultConfigValues.UPLOAD_FILE_SIZE_LIMIT);
    }

    uploadFileBatchLimit(): number {
        const limit = this.configService.get<number>('UPLOAD_FILE_BATCH_LIMIT', defaultConfigValues.UPLOAD_FILE_BATCH_LIMIT);
        return getSafeNumber(limit, defaultConfigValues.UPLOAD_FILE_BATCH_LIMIT);
    }

    uploadImageFileSizeLimit(): number {
        const limit = this.configService.get<number>('UPLOAD_IMAGE_FILE_SIZE_LIMIT', defaultConfigValues.UPLOAD_IMAGE_FILE_SIZE_LIMIT);
        return getSafeNumber(limit, defaultConfigValues.UPLOAD_IMAGE_FILE_SIZE_LIMIT);
    }

    uploadVideoFileSizeLimit(): number {
        const limit = this.configService.get<number>('UPLOAD_VIDEO_FILE_SIZE_LIMIT', defaultConfigValues.UPLOAD_VIDEO_FILE_SIZE_LIMIT);
        return getSafeNumber(limit, defaultConfigValues.UPLOAD_VIDEO_FILE_SIZE_LIMIT);
    }

    uploadAudioFileSizeLimit(): number {
        const limit = this.configService.get<number>('UPLOAD_AUDIO_FILE_SIZE_LIMIT', defaultConfigValues.UPLOAD_AUDIO_FILE_SIZE_LIMIT);
        return getSafeNumber(limit, defaultConfigValues.UPLOAD_AUDIO_FILE_SIZE_LIMIT);
    }

    batchUploadLimit(): number {
        const limit = this.configService.get<number>('BATCH_UPLOAD_LIMIT', defaultConfigValues.BATCH_UPLOAD_LIMIT);
        return getSafeNumber(limit, defaultConfigValues.BATCH_UPLOAD_LIMIT);
    }

    workflowFileUploadLimit(): number {
        const limit = this.configService.get<number>('WORKFLOW_FILE_UPLOAD_LIMIT', defaultConfigValues.WORKFLOW_FILE_UPLOAD_LIMIT);
        return getSafeNumber(limit, defaultConfigValues.WORKFLOW_FILE_UPLOAD_LIMIT);
    }
}
