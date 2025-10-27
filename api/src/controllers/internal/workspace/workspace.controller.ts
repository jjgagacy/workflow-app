import { RequireTenantContext } from "@/common/guards/require-tenant-context";
import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";

class TestUserDto {
    name: string;
    age: number;
    city: string;
}

/**
 * 请求：
 * curl "127.0.0.1:3001/internal/api/workspace?tenant_id=106bd7b2-29d5-4b7e-bc2c-0dc14b1a966a"
 * curl -H "Content-Type: application/json" \
          -d '{"name":"John","age":30,"city":"New York","tenant_id":"106bd7b2-29d5-4b7e-bc2c-0dc14b1a966a"}' \
          "127.0.0.1:3001/internal/api/workspace"
 * 
 */
@Controller('internal/api')
@RequireTenantContext()
export class InternalWorkspaceController {

    @Get('workspace')
    index(@Req() req: Request): string {
        const tenantId = (req as any).tenant?.id;
        return `workspace ${tenantId}`;
    }

    @Post('workspace')
    postUser(@Req() req: Request, @Body() body: TestUserDto): string {
        const tenantId = (req as any).tenant?.id;
        return `workspace ${tenantId} post user ${JSON.stringify(body)}`;
    }

}
