import { GraphQLErrorCode, GraphqlErrorCodes } from "../constants/graphql-error-codes";

export class GraphQLException extends Error {
    public extensions: Record<string, any>;

    constructor(
        message: string,
        code: GraphQLErrorCode = GraphqlErrorCodes.INTERNAL_SERVER_ERROR,
        extensions?: Record<string, any>
    ) {
        super(message);
        this.name = 'GraphQLBadRequestException';
        this.extensions = {
            code,
            ...extensions,
        };
    }
}
