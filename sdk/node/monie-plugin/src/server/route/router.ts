import { RequestReader } from "../../core/reader.class";
import { ResponseWriter } from "../../core/writer.class";
import { HandleResult, Route, RouteFilter, RouteHandler } from "./route.handler";
import { Session } from "@/core/classes/runtime";

export interface IRouter {
  dispatch(session: Session, data: any): void;
}

export class Router implements IRouter {
  private routes: Route[] = [];

  constructor(
    private requestReader: RequestReader,
    private responseWriter?: ResponseWriter
  ) { }

  registerRoute<T>(
    filter: RouteFilter,
    decoder: (raw: any) => T,
    handler: RouteHandler
  ) {
    const wrapped = (session: Session, raw: any) => {
      try {
        const data = decoder(raw);
        return handler(session, data);
      } catch (e: any) {
        if (this.responseWriter) {
          this.responseWriter.error(session.sessionId, {
            errorType: e.name,
            message: e.message,
          });
        }
        throw new Error(`Failed to call handler: ${e}`);
      }
    };

    this.routes.push({ filter, handler: wrapped });
  }

  async dispatch(session: Session, data: any) {
    for (const route of this.routes) {
      if (route.filter(data)) {
        return await route.handler(session, data);
      }
    }
  }
}
