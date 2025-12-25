import { Session } from "@/core/classes/runtime";


export enum TaskType {
  CPU = 'cpu',
  IO = 'io',
}

export interface HandleResult {
  taskType: TaskType;
  result?: unknown;
}

export type RouteFilter = (data: any) => boolean;
export type RouteHandlerResult =
  | Promise<HandleResult>
  | AsyncGenerator<any>
  | undefined;

export type RouteHandler = (session: Session, data: any) => RouteHandlerResult;

export interface Route {
  filter: RouteFilter;
  handler: RouteHandler;
}
