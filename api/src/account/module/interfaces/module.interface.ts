import { ModulePermInterface } from "src/account/interfaces/module-perm.interface";

export class ModuleInterface {
  id: number;
  key: string;
  name: string;
  perms?: ModulePermInterface[];
}
