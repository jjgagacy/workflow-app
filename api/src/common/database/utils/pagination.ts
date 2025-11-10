import { BadRequestGraphQLException } from "@/common/exceptions";
import { PAGE_LIMIT_MAX } from "@/config/constants";
import { FindManyOptions, ObjectLiteral, Repository } from "typeorm";

export interface PaginationResult<T> {
  data: T[];
  total: number;
}

export async function paginateRepository<T extends ObjectLiteral>(
  repository: Repository<T>,
  options: FindManyOptions<T>,
  paginate: boolean = true
): Promise<PaginationResult<T>> {
  try {
    if (paginate) {
      if (typeof options.take !== undefined && options.take! > PAGE_LIMIT_MAX) {
        throw new BadRequestGraphQLException(`The max page number allowed is ${PAGE_LIMIT_MAX}.`);
      }
      const [data, total] = await repository.findAndCount(options);
      return { data, total };
    } else {
      const data = await repository.find(options);
      return { data, total: data.length };
    }
  } catch (error) {
    throw new Error(`Find data failed: ${error.message}`);
  }
}

export function isPaginator(dto: { page?: number; limit?: number; }) {
  if (typeof dto.page === undefined || typeof dto.limit === undefined) {
    return false;
  }
  return true;
}
