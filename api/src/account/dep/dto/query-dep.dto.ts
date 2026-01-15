import { QueryDto } from "@/common/database/dto/query.dto";
import { notEmpty } from "@/common/utils/strings";

export class QueryDepDto extends QueryDto {
  key?: string;
  name?: string;
  parent?: string;
  order?: { [P in 'name' | 'id']?: 'ASC' | 'DESC' };
  tenantId?: string;

  setQueryArgs(args?: GetDepArgs) {
    if (!args) return;

    const {
      key,
      name,
      parent,
      tenantId
    } = args;

    Object.assign(this, {
      ...(notEmpty(tenantId) && { tenantId }),
      ...(notEmpty(key) && { key }),
      ...(notEmpty(name) && { name }),
      ...(notEmpty(parent) && { parent })
    });
  }
}
