export type RouteHandler = (request: any) => Promise<any>;

export interface RouteMatch {
  path: string;
  handler: RouteHandler;
}

export interface Route {
  path: string;
  handlerName: string;
}
