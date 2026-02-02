import { Request } from "@/core/entities/endpoint/endpoint.entity";
import { Response } from "@/core/entities/endpoint/response.entity";
import { Endpoint } from "@/interfaces/endpoint/endpoint";
export declare class Duck extends Endpoint {
    invoke(r: Request, values: Record<string, any>, settings: Record<string, any>): Promise<Response>;
}
//# sourceMappingURL=duck.d.ts.map