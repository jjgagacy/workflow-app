import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class Config {
    constructor(protected readonly configService: ConfigService
    ) { }

}