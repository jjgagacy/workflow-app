import { ProviderEntity } from "@/account/entities/provider.entity";
import { TenantDefaultModelEntity } from "@/account/entities/tenant-default-model.entity";
import { Injectable, NotImplementedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ProviderManager {
  constructor(
    @InjectRepository(ProviderEntity)
    private readonly providerRepository: Repository<ProviderEntity>,
    @InjectRepository(TenantDefaultModelEntity)
    private readonly tenantDefaultModelRepository: Repository<TenantDefaultModelEntity>,

  ) { }

  async getAllProvider(tenantId: string): Promise<ProviderEntity[]> {
    throw new NotImplementedException();
  }

}
