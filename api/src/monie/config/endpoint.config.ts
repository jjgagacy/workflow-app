import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EndPointConfig {
  constructor(protected readonly configService: ConfigService
  ) { }

  // Base url for site
  siteBaseUrl(): string {
    return this.configService.get<string>('SITE_BASE_URL', '');
  }

  // Base url for API endpoints
  apiBaseUrl(): string {
    return this.configService.get<string>('API_BASE_URL', '');
  }

  // Base url for service endpoints, displayed for API clients
  serviceBaseUrl(): string {
    return this.configService.get<string>('SERVICE_BASE_URL', '');
  }

  // Base url for web app
  webAppBaseUrl(): string {
    return this.configService.get<string>('WEB_APP_BASE_URL', '');
  }

  // Files url for file preview or download.
  filesUrl(): string {
    return this.configService.get<string>('FILES_URL', '');
  }
}
