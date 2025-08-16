import { QueryDto } from "src/common/database/dto/query.dto";
import { notEmpty, validNumber } from "src/common/utils/strings";

export class QueryMenuDto extends QueryDto {
  name?: string;
  status?: number;
  key?: string;
  parent?: string;
  order?: { [P in 'name' | 'status' | 'id' | 'sort']?: 'ASC' | 'DESC' };
  relations?: { module?: boolean; roles?: boolean; }

  setQueryArgs(args?: GetMenuArgs) {
    if (!args) return;
    const {
      key,
      name,
      parent,
      status
    } = args;
    
    Object.assign(this, {
      ...(notEmpty(args.key) && { key }),
      ...(notEmpty(args.name) && { name }),
      ...(notEmpty(args.parent) && { parent }),
      ...(validNumber(args.status) && { status }),
    });
  }
}
