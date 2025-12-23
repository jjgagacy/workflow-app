import { Request, Response } from "@/core/entities/endpoint/endpoint.entity";
import { SessionMessage } from "@/core/entities/event/message";

export abstract class Endpoint {
  constructor(
    public readonly session: SessionMessage
  ) { }

  abstract invoke(
    r: Request,
    values: Record<string, any>,
    settings: Record<string, any>,
  ): Promise<Response>;
}