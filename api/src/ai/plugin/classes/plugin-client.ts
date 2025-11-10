import { HttpService } from "@nestjs/axios";

export class BasePluginClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly baseUrl: string,
    private readonly secretKey: string
  ) { }

  private async sendRequest() {
  }
}
