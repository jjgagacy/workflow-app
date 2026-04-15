import { QueryDto } from "@/common/database/dto/query.dto";

export class QueryInstalledAppDto extends QueryDto {
  accountId?: number;
  tenantId?: string;
  appId?: string;
  isPinned?: boolean;
  order?: { [P in 'createdAt' | 'lastUsedAt']?: 'ASC' | 'DESC' };
}

export class BaseInstalledAppDto {
  isPinned?: boolean;
}

export class CreateInstalledAppDto extends BaseInstalledAppDto {
  accountId!: number;
  tenantId!: string;
  appId!: string;
  createdBy!: string;
  createdAt?: Date;
}

export class UpdateInstalledAppDto extends BaseInstalledAppDto {
  updatedBy!: string;
  updatedAt?: Date;
}
