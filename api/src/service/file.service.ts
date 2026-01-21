import { OpenDALStorage } from "@/storage/implements/opendal.storage";
import { Injectable } from "@nestjs/common";
import { UploadFileService } from "./upload-file.service";
import { FileHelper } from "./libs/helpers/file.helper";
import { UploadFilesEntity } from "@/account/entities/upload-files.entity";
import { CreatedRole } from "@/common/types/enums/role.enum";
import { decodeFilename } from "@/common/utils/decode";
import { MonieConfig } from "@/monie/monie.config";
import { AUDIO_EXTENSIONS, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "@/config/file.constants";
import { FileTooLargeError } from "./exceptions/file.error";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { v4 as uuidv4 } from 'uuid';
import { CreateUploadFileDto } from "./dto/file.dto";
import * as crypto from 'crypto';
import { checkEntityCreatedId } from "@/common/database/utils/validate";

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
    private readonly i18n: I18nService<I18nTranslations>
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
      hash,
      sourceUrl,
    });
    const uploadFilesEntity = await this.uploadFileService.create(createFileDto);
    checkEntityCreatedId(uploadFilesEntity, this.i18n);

    fileId = uploadFilesEntity.id;
    uploadFilesEntity.key = `uploads/${tenantId || ''}/${fileId}.${extension}`.replace(/\/+/g, '/');
    if (!sourceUrl) {
      uploadFilesEntity.sourceUrl = this.fileHelper.getSignedFileUrl(fileId);
    }
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


}
