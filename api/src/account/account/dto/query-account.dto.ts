import { QueryDto } from "@/common/database/dto/query.dto";
import { notEmpty, validId, validNumber } from "@/common/utils/strings";

export class QueryAccountDto extends QueryDto {
  id?: number;
  username?: string;
  realName?: string;
  status?: number;
  email?: string;
  mobile?: string;
  roleId?: number;
  relations?: { roles: boolean }
  order?: { [P in 'id' | 'status']?: 'ASC' | 'DESC' };
  tenantId: string;

  setQueryArgs(args?: GetAccountListArgs) {
    if (!args) return;

    const {
      id,
      username,
      email,
      mobile,
      realName,
      status,
      roleId,
      page,
      limit,
      relations
    } = args;

    // 使用对象解构和简写赋值
    Object.assign(this, {
      ...(validId(id) && { id }),
      ...(notEmpty(username) && { username }),
      ...(notEmpty(email) && { email }),
      ...(notEmpty(mobile) && { mobile }),
      ...(notEmpty(realName) && { realName }),
      ...(validNumber(status) && { status }),
      ...(validId(roleId) && { roleId }),
      ...(relations && { relations })
    });

    if (validNumber(page) && validNumber(limit)) {
      this.page = page;
      this.limit = limit;
    }
  }
}
