import { ModulePermInterface } from "@/account/interfaces/module-perm.interface";
import { ScopeInterface } from "@/account/interfaces/scope.interface";
import { ModuleInterface } from "@/account/module/interfaces/module.interface";
import { RoleInterface } from "@/account/role/interfaces/role.interface";

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
