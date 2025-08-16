import { MenuEntity } from "../../entities/menu.entity";
import { ModulePermInterface } from "../../interfaces/module-perm.interface";
import { ScopeInterface } from "../../interfaces/scope.interface";

export interface RolePermsInterface {
  // menu key
  menu: MenuEntity;
  scope: ScopeInterface[];
  perms: ModulePermInterface[];
}
