import { Request } from "@/core/entities/endpoint/endpoint.entity.js";
import { Response } from "@/core/entities/endpoint/response.entity.js";
import { SessionMessage } from "@/core/entities/event/message.js";
import { ClassWithMarker } from "../marker.class.js";

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
