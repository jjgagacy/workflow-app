import { Request } from "@/core/entities/endpoint/endpoint.entity";
import { Response } from "@/core/entities/endpoint/response.entity";
import { Endpoint } from "@/interfaces/endpoint/endpoint";

export class PinkTTS extends Endpoint {
  invoke(r: Request, values: Record<string, any>, settings: Record<string, any>): Promise<Response> {
    throw new Error("Method not implemented.");
  }
}
