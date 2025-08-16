import { MenuInterface } from "src/account/menu/interfaces/menu.interface";
import { CreatedUpdatedInterface } from "src/common/types/interfaces/created-updated.interface";

export interface RoleInterface extends CreatedUpdatedInterface {
  id?: number;
  key: string;
  name: string;
  parent?: string;
  status?: number;
  menus?: MenuInterface[];
  rolePerms?: RolePermsType[];
}
