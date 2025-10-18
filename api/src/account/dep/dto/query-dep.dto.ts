import { QueryDto } from "@/common/database/dto/query.dto";
import { notEmpty } from "@/common/utils/strings";

export class QueryDepDto extends QueryDto {
  key?: string;
  name?: string;
  parent?: string;
  order?: { [P in 'name' | 'id']?: 'ASC' | 'DESC' };

  setQueryArgs(args?: GetDepArgs) {
    if (!args) return;

    const {
      key,
      name,
      parent
    } = args;

    Object.assign(this, {
      ...(notEmpty(key) && { key }),
      ...(notEmpty(name) && { name }),
      ...(notEmpty(parent) && { parent })
    });
  }
}
