import { Between, FindOptionsWhere, In, IsNull, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not, ObjectLiteral } from "typeorm";

export type ConditionOperator =
  | 'equals'
  | 'like'
  | 'ilike'
  | 'in'
  | 'between'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'isNull'
  | 'not'
  | 'relation';

export interface FieldConditionConfig {
  field: string;
  operator: ConditionOperator;
  relationField?: string;
  transformValue?: (value: any) => any;
}

export interface QueryBuilderConfig {
  [paramKey: string]: FieldConditionConfig;
}

export function buildDynamicWhereConditions<T extends ObjectLiteral>(
  queryParams: any,
  conditionConfig: Record<string, FieldConditionConfig>,
  options: {
    ignoreUndefined?: boolean;
    transformParams?: (params: Record<string, any>) => Record<string, any>;
  } = {}
): FindOptionsWhere<T> {
  const { ignoreUndefined = true, transformParams } = options;
  let processedParam = queryParams;

  if (transformParams) {
    processedParam = transformParams(queryParams);
  }

  const where: FindOptionsWhere<T> = {};

  Object.keys(queryParams).forEach(paramKey => {
    const paramValue = processedParam[paramKey];
    const config = conditionConfig[paramKey];

    if (ignoreUndefined && paramValue === undefined) {
      return;
    }

    if (ignoreUndefined && paramValue === null) {
      return;
    }

    const finalValue = config.transformValue ? config.transformValue(paramValue) : paramValue;

    buildCondition(where, config, finalValue);
  });

  return where;
}

function buildCondition<T extends ObjectLiteral>(
  where: FindOptionsWhere<T>,
  config: FieldConditionConfig,
  value: any
): void {
  const fieldPath = config.field.split('.');

  switch (config.operator) {
    case 'like':
      setNestedField(where, fieldPath, Like(`%${value}%`));
      break;
    case 'ilike':
      setNestedField(where, fieldPath, Like(`%${value}%`));
      break;
    case 'in':
      setNestedField(where, fieldPath, In(Array.isArray(value) ? value : [value]));
      break;
    case 'between':
      if (Array.isArray(value) && value.length === 2) {
        setNestedField(where, fieldPath, Between(value[0], value[1]));
      }
      break;
    case 'greaterThan':
      setNestedField(where, fieldPath, MoreThan(value));
      break;
    case 'lessThan':
      setNestedField(where, fieldPath, LessThan(value));
      break;
    case 'greaterThanOrEqual':
      setNestedField(where, fieldPath, MoreThanOrEqual(value));
      break;
    case 'lessThanOrEqual':
      setNestedField(where, fieldPath, LessThanOrEqual(value));
      break;
    case 'isNull':
      setNestedField(where, fieldPath, IsNull());
      break;
    case 'not':
      setNestedField(where, fieldPath, Not(value));
      break;
    case 'relation':
      if (config.relationField) {
        const relationPath = [...fieldPath, config.relationField];
        setNestedField(where, relationPath, value);
      }
      break;
    case 'equals':
    default:
      setNestedField(where, fieldPath, value);
      break;
  }
}

function setNestedField<T extends ObjectLiteral>(
  obj: FindOptionsWhere<T>,
  pathArr: string[],
  value: any
): void {
  let current: any = obj;

  for (let i = 0; i < pathArr.length - 1; i++) {
    const key = pathArr[i];
    if (!current[key]) current[key] = {};
    current = current[key];
  }

  const lastkey = pathArr[pathArr.length - 1];
  current[lastkey] = value;
}


