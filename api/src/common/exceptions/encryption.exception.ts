import { HttpException, HttpStatus } from "@nestjs/common";

export class PrivateKeyNotFoundError extends HttpException {
    constructor(tenantId: string) {
        super(`Private key not found, tenant_id: ${tenantId}`, HttpStatus.NOT_FOUND);
    }
}
