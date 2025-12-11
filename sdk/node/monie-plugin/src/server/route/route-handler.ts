import { RouteHandler } from "./handler.type";

export interface RouteMatch {
  path: string;
  handler: RouteHandler;
}

export interface Route {
  path: string;
  handlerName: string;
}
