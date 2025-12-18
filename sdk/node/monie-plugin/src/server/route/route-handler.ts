import { RouteHandler } from "./handler.type";

export type RouteFilter = (data: any) => boolean;

export interface Route {
  filter: RouteFilter;
  handler: RouteHandler;
}
