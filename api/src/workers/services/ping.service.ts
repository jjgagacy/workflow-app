import { GlobalLogger } from "@/logger/logger.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PingService {
  constructor(
    private readonly logger: GlobalLogger,
  ) { }

  async ping(taskData: any): Promise<any> {
    this.logger.log(`Processing task data: ${JSON.stringify(taskData)}`);
    return "Processed: " + JSON.stringify(taskData);
  }
}
