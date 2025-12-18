import { SessionMessage } from "@/core/entities/event/message";

export class Endpoint {
  constructor(
    public session: SessionMessage
  ) { }
}