import { RoleInterface } from 'src/account/role/interfaces/role.interface';
import { CreatedUpdatedInterface } from 'src/common/types/interfaces/created-updated.interface';

export interface AccountInterface extends CreatedUpdatedInterface {
  id: number;
  username: string;
  realName?: string;
  password?: string;
  email?: string;
  mobile?: string;
  status?: number;
  lastIp?: string;
  roles?: RoleInterface[];
}
