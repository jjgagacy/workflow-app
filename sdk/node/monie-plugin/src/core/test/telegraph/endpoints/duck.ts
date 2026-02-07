import { Request } from "../../../../core/entities/endpoint/endpoint.entity.js";
import { Response } from "../../../../core/entities/endpoint/response.entity.js";
import { Endpoint } from "../../../../interfaces/endpoint/endpoint.js";
import { ToolInvokeMessage } from "../../../../interfaces/tool/invoke-message.js";

export class Duck extends Endpoint {
  async invoke(r: Request, values: Record<string, any>, settings: Record<string, any>): Promise<Response> {
    return ToolInvokeMessage.createText(`id: ${values.appId}`);
  }
}
