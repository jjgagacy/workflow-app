import { CustomScalar, Scalar } from "@nestjs/graphql";
import { Kind, ValueNode } from "graphql";

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<string, Date> {
    description = "Date custom scalar type"

    parseValue(value: string): Date {
        return new Date(value);
    }

    serialize(value: Date): string {
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
