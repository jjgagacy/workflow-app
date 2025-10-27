import { Controller, Get, Param, Post, Query, Req } from "@nestjs/common";

@Controller('internal/api')
export class InternalPluginInvokeController {
    @Get('')
    findAll(@Req() req: Request): string {
        console.log((req as any).tenant);
        return 'this action returns all cats';
    }

    @Get('tenants/:tenantId')
    tenantInfo(@Param('tenantId') tenantId?: string): string {
        return `tenant ${tenantId}`;
    }

    @Post()
    postStore(@Query() query: any): string {
        return 'store response';
    }

}
