import { ProviderEntity } from "@/account/entities/provider.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Like, Repository } from "typeorm";
import { PROVIDER_CONDITIONS, QueryProviderDto } from "../dtos/provider.dto";
import { isPaginator, paginateRepository } from "@/common/database/utils/pagination";
import { buildDynamicWhereConditions } from "@/common/database/utils/query-builder";
import { getPaginationOptions } from "@/common/database/dto/query.dto";

@Injectable()
export class ProviderListService {
  constructor(
    @InjectRepository(ProviderEntity)
    private readonly providerRepository: Repository<ProviderEntity>
  ) { }

  async query(queryParams: QueryProviderDto): Promise<{ data: ProviderEntity[], total: number }> {
    const findOptions = this.buildFindOptions(queryParams);
    return await paginateRepository(this.providerRepository, findOptions, isPaginator(queryParams));
  }

  buildFindOptions(
    queryParams: QueryProviderDto
  ): FindManyOptions<ProviderEntity> {
    const { order, relations, page, limit, ...whereParams } = queryParams;

    const findOptions: FindManyOptions<ProviderEntity> = {
      where: buildDynamicWhereConditions(whereParams, PROVIDER_CONDITIONS)
    };

    if (order && Object.keys(order).length > 0) {
      findOptions.order = order;
    }

    if (relations && Object.keys(relations).length > 0) {
      findOptions.relations = relations;
    }

    const pager = { page, limit };
    if (isPaginator(pager)) {
      const pagerData = getPaginationOptions(pager);
      findOptions.skip = pagerData.skip;
      findOptions.take = pagerData.take;
    }

    return findOptions;
  }
}
