import { CustomScalar, Scalar } from "@nestjs/graphql";
import { Kind, ValueNode } from "graphql";

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<string, Date> {
  description = "Date custom scalar type"

  parseValue(value: unknown): Date {
    if (typeof value === 'string') {
      return new Date(value);
    }
    if (typeof value === 'number') {
      return new Date(value);
    }
    throw new Error('Invalid type for Date scalar');
  }

  serialize(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }
    if (!(value instanceof Date)) {
      throw new Error('Value is not an instance of Date');
    }
    return value.toISOString();
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }

    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }

    throw new Error(`Unresolved ${ast.kind} to Date`);
  }
}
