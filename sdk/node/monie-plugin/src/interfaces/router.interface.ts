import { Session } from "@/core/classes/runtime";

export interface RouterContract {
  dispatch(session: Session, data: any): void;
}
