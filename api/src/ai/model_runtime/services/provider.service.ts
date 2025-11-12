import { ProviderModelSettingEntity } from "@/account/entities/provider-model-setting.entity";
import { ProviderEntity } from "@/account/entities/provider.entity";
import { TenantPreferredProviderEntity } from "@/account/entities/tenant-preferred-provider.entity";
import { MonieConfig } from "@/monie/monie.config";
import { Injectable, NotImplementedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProviderCofigurations } from "../classes/provider.configuration";
import { ModelType } from "../enums/model-runtime.enum";
import { ProviderModelBundle } from "../entities/model.entity";
import { Provider } from "../classes/provider.class";
import { ProviderModel } from "../classes/provider-model.class";
import { DefaultModel } from "../classes/default-model.class";
import { TenantDefaultModelEntity } from "@/account/entities/tenant-default-model.entity";

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(ProviderEntity)
    private readonly providerRepository: Repository<ProviderEntity>,
    @InjectRepository(ProviderModelSettingEntity)
    private readonly providerModelSettingRepository: Repository<ProviderModelSettingEntity>,
    @InjectRepository(TenantPreferredProviderEntity)
    private readonly tenantPreferredProviderRepository: Repository<TenantPreferredProviderEntity>,
    private readonly monieConfig: MonieConfig,
  ) { }

  async getConfigurations(tenantId: string): Promise<ProviderCofigurations> {
    // 获取所有提供商记录
    // 初始化试用提供商记录
    // 获取所有提供商模型记录
    // 获取所有提供商实体
    // 获取首选提供商类型
    // 获取所有提供商模型设置
    // 构建提供商配置对象
    // 转换为自定义配置
    // 转换为系统配置
    // 获取首选提供商类型
    // 获取提供商模型设置
    // 转换为模型设置
    throw new NotImplementedException();
  }

  async getProviderModelBundle(
    tenantId: string,
    provider: string,
    modelType: ModelType
  ): Promise<ProviderModelBundle> {
    throw new NotImplementedException();
  }

  async getDefaultModel(tenantId: string, modelType: ModelType): Promise<DefaultModel> {
    throw new NotImplementedException();
  }

  async getFirstProviderModel(tenantId: string, modelType: ModelType): Promise<[string | null, string | null]> {
    throw new NotImplementedException();
  }

  async updateDefaultModel(tenantId: string, modelType: ModelType, provider: string, model: string): Promise<TenantDefaultModelEntity> {
    throw new NotImplementedException();
  }

  private async getAllProvider(tenantId: string): Promise<Map<string, Provider[]>> {
    throw new NotImplementedException();
  }

  private async getAllProviderModels(tenantId: string): Promise<Map<string, ProviderModel[]>> {
    throw new NotImplementedException();
  }

  private async getPreferredModelProviders(tenantId: string): Promise<Map<string, TenantPreferredProviderEntity>> {
    throw new NotImplementedException();
  }
}

