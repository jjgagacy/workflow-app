import { Request } from "@/core/entities/endpoint/endpoint.entity";
import { Response } from "@/core/entities/endpoint/response.entity";
import { SessionMessage } from "@/core/entities/event/message";
import { ClassWithMarker } from "../marker.class";

export const ENDPOINT_SYMBOL = Symbol.for('plugin.endpoint');

export abstract class Endpoint {
  static [ENDPOINT_SYMBOL] = true;

  constructor(
    public readonly session: SessionMessage
  ) { }

  abstract invoke(
    r: Request,
    values: Record<string, any>,
    settings: Record<string, any>,
  ): Promise<Response>;
}

export type EndpointClassType = ClassWithMarker<Endpoint, typeof ENDPOINT_SYMBOL>;
export function isEndpointClass(cls: any): cls is EndpointClassType {
  return Boolean(cls?.[ENDPOINT_SYMBOL]);
}
