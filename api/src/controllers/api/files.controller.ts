import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { Express } from "express";
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentTenent } from "@/common/decorators/current-tenant";
import { FileService } from "@/service/file.service";
import { FileNotFoundError, InvalidFilenameError } from "@/service/exceptions/file.error";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { CreatedRole } from "@/common/types/enums/role.enum";
import { CurrentUser } from "@/common/decorators/current-user";

@Controller('api/files')
export class FilesController {
  constructor(
    private readonly fileService: FileService,
    private readonly i18n: I18nService<I18nTranslations>
  ) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentTenent() tenant: any,
    @CurrentUser() user: any
  ) {
    if (file.size == 0) {
      throw FileNotFoundError.create(this.i18n);
    }
    if (file.filename.length === 0) {
      throw InvalidFilenameError.create(this.i18n);
    }
    const uploadFilesEntity = await this.fileService.uploadFile(file, {
      user: { role: CreatedRole.ACCOUNT, accountId: user.id },
      tenantId: tenant.id,
    });
    return uploadFilesEntity.id;
  }
}
