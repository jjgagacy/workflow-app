import { PageInfoInterface } from '@/common/types/interfaces/page-info.interface';
import { RoleInterface } from './role.interface';

export interface RoleListInterface {
  data: RoleInterface[];
  pageInfo: PageInfoInterface;
}
