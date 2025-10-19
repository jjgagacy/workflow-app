import { Module } from "@nestjs/common";
import { MonieConfig } from "./monie.config";
import { FeatureService } from "./feature.service";

@Module({
    providers: [MonieConfig, FeatureService],
    exports: [MonieConfig, FeatureService],
})
export class MonieModule { } 
