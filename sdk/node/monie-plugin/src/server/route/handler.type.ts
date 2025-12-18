import { Session } from "@/core/classes/runtime";

export type RouteHandler = (session: Session, data: any) => Promise<any> | any;
