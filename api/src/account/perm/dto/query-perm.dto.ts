import { QueryDto } from "src/common/database/dto/query.dto";

export class QueryPermDto extends QueryDto {
  key?: string;
  name?: string;
  order?: { [P in 'id' | 'key' | 'name']?: 'ASC' | 'DESC' };
}
