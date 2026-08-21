import { QueryDto } from "@/common/database/dto/query.dto";
import { IsNotEmpty } from "class-validator";

export class QueryWorkflowDto extends QueryDto {
  tenantId?: string;
  appId?: string;
  type?: string;
  order?: { [P in 'createdAt' | 'updatedAt' | 'type']?: 'ASC' | 'DESC' };
}

// 工作流 Workflow 基础字段
// type 字段从`AppEntity`的`mode`字段，就是 AppMode 类型的值
export class BaseWorkflowDto {
  type?: string;
  graph?: string;
  features?: string;
  environmentVariables?: string;
  sessionVariables?: string;
}

export class CreateWorkflowDto extends BaseWorkflowDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  tenantId!: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  appId!: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  declare type: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  declare graph: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  declare features: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  declare environmentVariables: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  declare sessionVariables: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  createdBy!: string;

  createdAt?: Date;
}

export class UpdateWorkflowDto extends BaseWorkflowDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  updatedBy!: string;

  updatedAt?: Date;
}
