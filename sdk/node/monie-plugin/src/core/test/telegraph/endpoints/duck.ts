import { Request } from "@/core/entities/endpoint/endpoint.entity";
import { Response } from "@/core/entities/endpoint/response.entity";
import { Endpoint } from "@/interfaces/endpoint/endpoint";

export class Duck extends Endpoint {
  async invoke(r: Request, values: Record<string, any>, settings: Record<string, any>): Promise<Response> {
    //console.log('params:', values);
    return { text: `id: ${values.appId}` };
  }
}
