import { OpenDALStorage } from "@/storage/implements/opendal.storage";
import { Injectable } from "@nestjs/common";
import { UploadFileService } from "./upload-file.service";
import { FileHelper } from "./libs/helpers/file.helper";
import { UploadFilesEntity } from "@/account/entities/upload-files.entity";
import { CreatedRole } from "@/common/types/enums/role.enum";
import { decodeFilename } from "@/common/utils/decode";
import { MonieConfig } from "@/monie/monie.config";
import { AUDIO_EXTENSIONS, DOCUMENT_EXTENSIONS, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "@/config/file.constants";
import { FileNotFoundError, FileTooLargeError, UnsupportedFileTypeError } from "./exceptions/file.error";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { v4 as uuidv4 } from 'uuid';
import { CreateUploadFileDto } from "./dto/file.dto";
import * as crypto from 'crypto';
import { checkEntityCreatedId } from "@/common/database/utils/validate";
import { HttpService } from "@nestjs/axios";
import { File } from "./libs/file/file";
import { FileAttribute } from "./libs/file/file.enum";
import { firstValueFrom } from "rxjs/internal/firstValueFrom";
import { PromptMessageContent } from "@/ai/prompt/classes/abstract.class";
import { CONTENT_TYPE_MAPPING, PromptContent } from "@/ai/prompt/classes/message-types.class";
import { ImageDetail } from "./libs/file/file.type";

interface UploadUser {
  role: CreatedRole;
  accountId?: number;
  userId?: string;
}

export interface UploadOptions {
  user: UploadUser;
  tenantId: string;
  sourceUrl?: string;
}

@Injectable()
export class FileService {
  constructor(
    private readonly openDALStorage: OpenDALStorage,
    private readonly uploadFileService: UploadFileService,
    private readonly fileHelper: FileHelper,
    private readonly monieConfig: MonieConfig,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly httpService: HttpService,
  ) { }

  async uploadFile(
    file: Express.Multer.File,
    { user, sourceUrl, tenantId }: UploadOptions,
  ): Promise<UploadFilesEntity> {
    const { originalname, buffer, mimetype, size } = file;
    const decodeName = decodeFilename(originalname);

    const filename = this.fileHelper.validateFilename(decodeName);
    const extension = this.fileHelper.extractFileExtension(decodeName);

    if (!this.isFileSizeWithinLimit(extension, size)) {
      throw FileTooLargeError.create(this.i18n);
    }

    let fileId = uuidv4();
    const key = `uploads/${tenantId || ''}/${fileId}.${extension}`.replace(/\/+/g, '/');

    const hash = crypto.createHash('sha3-256').update(buffer).digest('hex');
    // save to db
    const createFileDto = new CreateUploadFileDto({
      tenantId,
      key,
      name: filename,
      mimeType: mimetype,
      size,
      extension,
      createdRole: user.role,
      createdAccount: user.role === CreatedRole.ACCOUNT ? user.accountId : undefined,
      createdUser: user.role === CreatedRole.USER ? user.userId : undefined,
      storageType: 'opendal',
      hash,
      sourceUrl,
    });
    // insert to db
    const uploadFilesEntity = await this.uploadFileService.create(createFileDto);
    checkEntityCreatedId(uploadFilesEntity, this.i18n);

    fileId = uploadFilesEntity.id;
    uploadFilesEntity.key = `uploads/${tenantId || ''}/${fileId}.${extension}`.replace(/\/+/g, '/');
    if (!sourceUrl) {
      uploadFilesEntity.sourceUrl = this.fileHelper.getSignedFileUrl(fileId);
    }
    // update uploadfiles to db
    await this.uploadFileService.save(uploadFilesEntity);
    // save to storage
    await this.openDALStorage.save(uploadFilesEntity.key, buffer);

    return uploadFilesEntity;
  }

  isFileSizeWithinLimit(extension: string, fileSize: number): boolean {
    let fileSizeLimit: number;

    if (IMAGE_EXTENSIONS.has(extension)) {
      fileSizeLimit = this.monieConfig.uploadImageFileSizeLimit();
    } else if (VIDEO_EXTENSIONS.has(extension)) {
      fileSizeLimit = this.monieConfig.uploadVideoFileSizeLimit();
    } else if (AUDIO_EXTENSIONS.has(extension)) {
      fileSizeLimit = this.monieConfig.uploadAudioFileSizeLimit();
    } else {
      fileSizeLimit = this.monieConfig.uploadImageFileSizeLimit();
    }

    fileSizeLimit *= 1024 * 1024;
    return fileSize <= fileSizeLimit;
  }

  // This method retrieves an image preview based on the provided file ID or UploadFilesEntity. 
  // It verifies the signature using the provided timestamp, nonce, and sign parameters. If the
  // signature is valid, it fetches the corresponding UploadFilesEntity and checks if the file 
  // extension is supported for image previews. 
  // If all checks pass, it returns the UploadFilesEntity; otherwise, it throws appropriate errors.
  async getImagePreview(fileIdOrEntity: string | UploadFilesEntity, timestamp: string, nonce: string, sign: string): Promise<UploadFilesEntity | null> {
    const fileId = typeof fileIdOrEntity === 'string' ? fileIdOrEntity : fileIdOrEntity.id;
    const verifySignature = this.fileHelper.verifyFileSignature(fileId, timestamp, nonce, sign);
    if (!verifySignature) {
      throw FileNotFoundError.create(this.i18n);
    }

    const uploadFileEntity = typeof fileIdOrEntity === 'string'
      ? await this.uploadFileService.findById(fileId)
      : fileIdOrEntity;
    if (!uploadFileEntity) {
      throw FileNotFoundError.create(this.i18n);
    }

    if (!IMAGE_EXTENSIONS.has(uploadFileEntity.extension)) {
      throw UnsupportedFileTypeError.create(this.i18n);
    }
    return uploadFileEntity;
  }

  async getUploadFileEntity(fileId: string): Promise<UploadFilesEntity | null> {
    if (fileId === '') {
      return null;
    }
    return await this.uploadFileService.findById(fileId);
  }

  async download(file: File): Promise<Buffer> {
    if (file.transferMethod === 'remote_url') {
      if (!file.remoteUrl) {
        throw new Error('Remote URL is not set for the file.');
      }
      if (!file.remoteUrl.startsWith('http')) {
        throw new Error('Invalid remote URL format.');
      }
      try {
        const response = await firstValueFrom(
          this.httpService.get(file.remoteUrl, { responseType: 'arraybuffer' })
        );
        return Buffer.from(response.data);
      } catch (error: any) {
        throw new Error(`Failed to download remote file: ${error.message}`);
      }
    }
    // For local files, we assume the storageKey is set and use OpenDALStorage to load the file
    if (!file.storageKey) {
      throw new Error('Storage key is not set for the file.');
    }
    const data = await this.openDALStorage.load(file.storageKey);
    return data;
  }

  async getEncodeString(file: File): Promise<string> {
    const buffer = await this.download(file);
    return buffer.toString('base64');
  }

  async toPromptContent(file: File, imageDetail?: ImageDetail): Promise<PromptContent> {
    if (!file.extension) {
      throw new Error('File extension is not set.');
    }
    if (!file.mimeType) {
      throw new Error('File MIME type is not set.');
    }
    const fileType = this.getFileTypeFromExtension(file.extension);
    const supportedTypes = ['image', 'audio', 'video', 'document'];
    if (!supportedTypes.includes(fileType)) {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
    const TargetClass = CONTENT_TYPE_MAPPING[fileType as keyof typeof CONTENT_TYPE_MAPPING];
    if (!TargetClass) {
      throw new Error(`No target class found for file type: ${fileType}`);
    }

    const instance = new TargetClass();

    const sendFormat = this.monieConfig.multiModalTransfer();
    instance.type = fileType;
    instance.format = file.extension.replace(/^\./, ''); // remove leading dot if present
    instance.mime_type = file.mimeType;
    instance.base64_data = sendFormat === 'base64' ? await this.getEncodeString(file) : '';
    instance.url = sendFormat === 'url' ? file.remoteUrl || '' : '';

    if (fileType === 'image') {
      instance.detail = imageDetail || ImageDetail.LOW;
    }
    return instance as PromptContent;
  }

  private getFileTypeFromExtension(extension: string): string {
    if (IMAGE_EXTENSIONS.has(extension)) {
      return 'image';
    } else if (VIDEO_EXTENSIONS.has(extension)) {
      return 'video';
    } else if (AUDIO_EXTENSIONS.has(extension)) {
      return 'audio';
    } else if (DOCUMENT_EXTENSIONS.has(extension)) {
      return 'document';
    } else {
      return 'unknown';
    }
  }
}
