import { QueryDto } from "@/common/database/dto/query.dto";
import { notEmpty, validNumber } from "@/common/utils/strings";

export class QueryModuleDto extends QueryDto {
  key?: string;
  name?: string;
  relations?: { perms?: boolean, menus?: boolean };
  order?: { [P in 'key' | 'name' | 'id']?: 'ASC' | 'DESC' };
  tenantId?: string;

  setQueryArgs(args?: GetModuleListArgs) {
    if (!args) return;

    const { key, name, page, limit, relations, tenantId } = args;

    // 使用对象解构和条件赋值
    Object.assign(this, {
      ...(notEmpty(key) && { key }),
      ...(notEmpty(name) && { name }),
      ...(notEmpty(tenantId) && { tenantId }),
      ...(typeof relations !== 'undefined' && { relations })
    });

    if (validNumber(page) && validNumber(limit)) {
      this.page = page;
      this.limit = limit;
    }
  }
}
