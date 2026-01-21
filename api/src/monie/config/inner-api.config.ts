import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { toBoolean } from "../helpers/to-boolean";

@Injectable()
export class InnerApiConfig {
  constructor(protected readonly configService: ConfigService
  ) { }

  innerApiEnabled(): boolean {
    return toBoolean(this.configService.get<boolean>('INNER_API_ENABLED', false));
  }

  innerApiKey(): string | undefined {
    return this.configService.get<string>('INNER_API_KEY');
  }
}