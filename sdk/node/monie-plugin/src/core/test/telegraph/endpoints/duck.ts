import { Request } from "@/core/entities/endpoint/endpoint.entity";
import { Response } from "@/core/entities/endpoint/response.entity";
import { Endpoint } from "@/interfaces/endpoint/endpoint";
import { ToolInvokeMessage } from "@/interfaces/tool/invoke-message";

export class Duck extends Endpoint {
  async invoke(r: Request, values: Record<string, any>, settings: Record<string, any>): Promise<Response> {
    return ToolInvokeMessage.createText(`id: ${values.appId}`);
  }
}
