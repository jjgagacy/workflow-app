import { Controller, Get } from "@nestjs/common";

@Controller('internal/api')
export class InternalPluginApiController {

    @Get('/fetch/app/info')
    appInfo(): string {
        return 'appInfo';
    }
}