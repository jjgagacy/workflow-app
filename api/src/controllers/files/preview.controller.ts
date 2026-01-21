import { OpenDALStorage } from "@/storage/implements/opendal.storage";
import { Controller, Get, Param, Res } from "@nestjs/common";
import { Response } from 'express';
import { createReadStream } from "node:fs";
import { join } from "node:path";

@Controller('files/preview')
export class PreviewController {

  constructor(
    private readonly openDALStorage: OpenDALStorage
  ) { }

  @Get(':fileId')
  async previewImage(@Param('fileId') fileId: string, @Res() res: Response) {
    const key = `uploads/ChatGPT.png`;
    const data = await this.openDALStorage.load(key);

    const filePath = join(process.cwd(), 'storage', key);

    res.setHeader('Content-Type', '');
    res.setHeader('Cache-Control', 'private, max-age=3600'); // 私有缓存

    const stream = createReadStream(filePath);
    return stream.pipe(res);
  }
}
