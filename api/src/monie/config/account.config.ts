import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { toBoolean } from "../helpers/to-boolean";

@Injectable()
export class AccountConfig {
    constructor(protected readonly configService: ConfigService
    ) { }

    educationEnabled(): boolean {
        return toBoolean(this.configService.get<boolean>('EDUCATION_ENABLED', false));
    }

}