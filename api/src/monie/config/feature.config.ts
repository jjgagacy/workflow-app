import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class FeatureConfig {
  constructor(protected readonly configService: ConfigService
  ) { }

  mailType(): string {
    return this.configService.get<string>('MAIL_TYPE', '');
  }

  // multiModalTransfer: 'base64' | 'url'
  multiModalTransfer(): string {
    return this.configService.get<string>('MULTI_MODAL_TRANSFER', 'base64');
  }
}