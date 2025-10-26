import { Controller, Get } from "@nestjs/common";

@Controller('internal/api')
export class InternalPluginInvokeController {
    @Get()
    findAll(): string {
        return 'this action returns all cats';
    }
}
