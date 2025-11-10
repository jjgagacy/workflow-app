import { QueryDto } from "@/common/database/dto/query.dto";
import { FieldConditionConfig } from "@/common/database/utils/query-builder";

export class QueryProviderDto extends QueryDto {
  providerName?: string;
  providerType?: string;
  isValid?: boolean;
  tenantId?: string;
  relations?: { tenant?: boolean };
  order?: { [P in 'id' | 'created_at']?: 'ASC' | 'DESC' };
}

export const PROVIDER_CONDITIONS: Record<string, FieldConditionConfig> = {
  providerName: { field: 'providerName', operator: 'like' },
  providerType: { field: 'providerType', operator: 'equals' },
  isValid: { field: 'isValid', operator: 'equals' },
  tenantId: { field: 'tenant', operator: 'relation', relationField: 'id' },
};

