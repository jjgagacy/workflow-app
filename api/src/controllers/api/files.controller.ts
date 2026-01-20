import { Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { Express } from "express";
import { FileInterceptor } from '@nestjs/platform-express';
import { decodeFilename } from "@/common/utils/decode";

@Controller('api/files')
export class FilesController {

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const filename = decodeFilename(file.originalname);
    console.log(file);
    /**
     * {
        fieldname: 'file',
        originalname: 'è¡\x97å¤´è\x89ºæ\x9C¯.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 01 00 01 00 00 ff e2 01 d8 49 43 43 5f 50 52 4f 46 49 4c 45 00 01 01 00 00 01 c8 00 00 00 00 04 30 00 00 ... 135134 more bytes>,
        size: 135184
      }
     */
    console.log('filename', filename);

    return {
      filename: file.originalname,
      size: file.size,
      path: file.path
    };
  }
}