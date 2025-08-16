import { QueryDto } from "src/common/database/dto/query.dto";
import { notEmpty, validNumber } from "src/common/utils/strings";

export class QueryModuleDto extends QueryDto {
  key?: string;
  name?: string;
  relations?: { perms?: boolean, menus?: boolean };
  order?: { [P in 'key' | 'name' | 'id']?: 'ASC' | 'DESC' };

  setQueryArgs(args?: GetModuleListArgs) {
    if (!args) return;

    const { key, name, page, limit, relations } = args;

    // 使用对象解构和条件赋值
    Object.assign(this, {
      ...(notEmpty(key) && { key }),
      ...(notEmpty(name) && { name }),
      ...(typeof relations !== 'undefined' && { relations })
    });

    if (validNumber(page) && validNumber(limit)) {
      this.page = page;
      this.limit = limit;
      this.checkLimitAndThrow();
    }
  }
}
