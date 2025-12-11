export type RouteHandler = (request: any) => Promise<any>;

export abstract class BaseHandler {
  abstract handle(message: any): Promise<any>;
  // CPU-intensive: false by default (can be overridden in subclasses or YAML configuration)
  cpuBound?: boolean;
}
