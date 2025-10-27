import { applyDecorators, UseGuards } from "@nestjs/common";
import { TenantContextGuard } from "./tenant-context.guard";

export function RequireTenantContext() {
    return applyDecorators(
        UseGuards(TenantContextGuard)
    )
}
