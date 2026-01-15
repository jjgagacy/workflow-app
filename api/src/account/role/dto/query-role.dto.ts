import { QueryDto } from "@/common/database/dto/query.dto";
import { notEmpty, validNumber } from "@/common/utils/strings";

export class QueryRoleDto extends QueryDto {
  id?: number;
  name?: string;
  status?: number;
  key?: string;
  parent?: string;
  order?: { [P in 'name' | 'status' | 'id']?: 'ASC' | 'DESC' };
  relations?: { menus: boolean; };
  tenantId?: string;

  setQueryArgs(args?: GetRoleListArgs) {
    if (!args) return;

    const { id, key, name, parent, status, page, limit } = args;

    // 使用对象解构和条件赋值
    Object.assign(this, {
      ...(validNumber(id) && { id }),
      ...(notEmpty(key) && { key }),
      ...(notEmpty(name) && { name }),
      ...(notEmpty(parent) && { parent }),
      ...(validNumber(status) && { status }),
      ...(notEmpty(args.tenantId) && { tenantId: args.tenantId }),
    });

    if (validNumber(page) && validNumber(limit)) {
      this.page = page;
      this.limit = limit;
    }
  }
}
