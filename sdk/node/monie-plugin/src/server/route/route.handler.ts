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
export type RouteHandler = (session: Session, data: any) => Promise<HandleResult> | AsyncGenerator<any> | undefined;

export interface Route {
  filter: RouteFilter;
  handler: RouteHandler;
}
