import { QueryDto } from "@/common/database/dto/query.dto";
import { validId, validNumber } from "@/common/utils/strings";
import { IsNotEmpty } from "class-validator";
import { AppMode } from "../types/app.type";

export class QueryAppDto extends QueryDto {
  accountId?: number;
  tenantId?: string;
  name?: string;
  mode?: string;
  isPublic?: boolean;
  order?: { [P in 'id' | 'name']?: 'ASC' | 'DESC' };

  setQueryArgs(args?: GetAppListArgs) {
    if (!args) return;

    const {
      accountId,
      tenantId,
      name,
      mode,
      isPublic,
      page,
      limit,
    } = args;

    Object.assign(this, {
      ...(validId(accountId) && { accountId }),
      ...(tenantId && { tenantId }),
      ...(name && { name }),
      ...(mode && { mode }),
      ...(typeof isPublic === 'boolean' && { isPublic }),
    });

    if (validNumber(page) && validNumber(limit)) {
      this.page = page;
      this.limit = limit;
    }
  }
}

export class BaseAppDto {
  description?: string;
  icon?: string;
  enableSite?: boolean;
  enableApi?: boolean;
  isPublic?: boolean;
  workflowId?: string;
}

export class CreateAppDto extends BaseAppDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  accountId!: number;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  tenantId!: string;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  name!: string;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  mode!: AppMode;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  createdBy!: string;
  createdAt?: Date;
}

export class UpdateAppDto extends BaseAppDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  updatedBy!: string;
  updatedAt?: Date;
}


