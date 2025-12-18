import type { RouterContract } from "../../interfaces/router.interface";
import { RequestReader } from "../../core/reader.class";
import { ResponseWriter } from "../../core/writer.class";
import { Route, RouteFilter } from "./route-handler";
import { Session } from "@/core/classes/runtime";

export class Router implements RouterContract {
  private routes: Route[] = [];

  constructor(
    private requestReader: RequestReader,
    private responseWriter?: ResponseWriter
  ) { }

  registerRoute<T>(
    filter: RouteFilter,
    decoder: (raw: any) => T,
    handler: (session: Session, data: T) => any
  ) {
    const wrapped = async (session: Session, raw: any) => {
      try {
        const data = decoder(raw);
        return await handler(session, data);
      } catch (e: any) {
        if (this.responseWriter) {
          this.responseWriter.error(session.sessionId, {
            errorType: e.name,
            message: e.message,
          });
        }
      }
    };

    this.routes.push({ filter, handler: wrapped });
  }

  async dispatch(session: Session, data: any): Promise<any> {
    for (const route of this.routes) {
      if (route.filter(data)) {
        return await route.handler(session, data);
      }
    }
  }
}