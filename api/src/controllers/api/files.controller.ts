import { Controller, Post, UploadedFile } from "@nestjs/common";
import { Express } from "express";

@Controller('api/files')
export class FilesController {
  @Post('upload')
  async uploadFile() {
    return {};
  }
}