import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { toBoolean } from "../helpers/to-boolean";

@Injectable()
export class FeatureConfig {
    constructor(protected readonly configService: ConfigService
    ) { }

    mailType(): string {
        return this.configService.get<string>('MAIL_TYPE', '');
    }
}