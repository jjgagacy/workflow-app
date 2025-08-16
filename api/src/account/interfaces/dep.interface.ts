import { AccountInterface } from "../account/interfaces/account.interface";

export interface DepInterface {
  id?: number;
  key: string;
  name: string;
  parent?: string;
  remarks?: string;
  children?: DepInterface[];
  manager?: AccountInterface;
}
