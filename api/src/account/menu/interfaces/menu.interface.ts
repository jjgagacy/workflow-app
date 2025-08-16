import { ModulePermInterface } from "src/account/interfaces/module-perm.interface";
import { ScopeInterface } from "src/account/interfaces/scope.interface";
import { ModuleInterface } from "src/account/module/interfaces/module.interface";
import { RoleInterface } from "src/account/role/interfaces/role.interface";

export interface MenuInterface {
  id?: number;
  name: string;
  key: string;
  parent?: string;
  sort?: number;
  icon?: string;
  status?: number;
  roles?: RoleInterface[];
  children?: MenuInterface[];
  module?: ModuleInterface;
  modulePerm?: ModulePermInterface[];
  scope?: ScopeInterface[];
}
