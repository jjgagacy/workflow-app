import { CurrentTenent } from "@/common/decorators/current-tenant";
import { IMAGE_MIME_TYPES } from "@/config/file.constants";
import { I18nTranslations } from "@/generated/i18n.generated";
import { FileNotFoundError } from "@/service/exceptions/file.error";
import { FileService } from "@/service/file.service";
import { convertToIconLanguage, MarketplaceService } from "@/service/marketplace.service";
import { UploadFileService } from "@/service/upload-file.service";
import { OpenDALStorage } from "@/storage/implements/opendal.storage";
import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { Response } from 'express';
import { I18nService } from "nestjs-i18n";
import { Readable } from "node:stream";

@Controller('files/preview')
export class PreviewController {

  constructor(
    private readonly uploadFileService: UploadFileService,
    private readonly openDALStorage: OpenDALStorage,
    private readonly fileService: FileService,
    private readonly marketplaceService: MarketplaceService,
    private readonly i18n: I18nService<I18nTranslations>
  ) { }

  @Get(':fileId')
  async previewImage(
    @Param('fileId') fileId: string,
    @Query() query: any,
    @Res() res: Response,
  ) {
    const uploadFileEntity = await this.uploadFileService.findById(fileId);
    if (!uploadFileEntity) {
      throw FileNotFoundError.create(this.i18n);
    }
    await this.fileService.getImagePreview(uploadFileEntity, query?.timestamp || '', query?.nonce || '', query?.sign || '');

    const key = uploadFileEntity.key;
    const data = await this.openDALStorage.load(key);
    // const filePath = join(process.cwd(), 'storage', key);

    res.setHeader('Content-Type', IMAGE_MIME_TYPES[uploadFileEntity.extension]);
    res.setHeader('Cache-Control', 'private, max-age=3600'); // 私有缓存

    const stream = Readable.from(data);
    return stream.pipe(res);
  }

  @Get('model-provider/icon/:provider/:theme/:lang/:size')
  async previewModelProviderIcon(
    @Param('provider') provider: string,
    @Param('theme') theme: string,
    @Param('lang') lang: string,
    @Param('size') size: string,
    @Res() res: Response,
  ) {
    const result = await this.marketplaceService.getModelProviderIcon(provider, theme || 'light', convertToIconLanguage(lang || 'en_US'), size === 'small');
    const { data, mimeType } = result || { data: null, mimeType: 'image/png' };
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(data);
  }
}
