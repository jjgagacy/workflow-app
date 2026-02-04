import { InvokeError } from "monie-plugin";
export declare const invokeErrorMapping: Map<new (...args: any[]) => InvokeError, Array<new (...args: any[]) => Error>>;
export declare function mapToInvokeError(error: unknown): InvokeError;
//# sourceMappingURL=error.d.ts.map