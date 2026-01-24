import { MailClient, SendEmailDto } from "../interfaces/client.interface";

// todo
export class ResendClient implements MailClient {
  private readonly resend: any;

  constructor(apiKey: string, apiUrl?: string) {
    this.resend = undefined;
  }

  send(dto: SendEmailDto): Promise<any> {
    throw new Error("Method not implemented.");
  }
}