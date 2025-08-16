import { PageInfoInterface } from 'src/common/types/interfaces/page-info.interface';
import { ModuleInterface } from './module.interface';

export interface ModuleListInterface {
  data: ModuleInterface[];
  pageInfo: PageInfoInterface;
}
