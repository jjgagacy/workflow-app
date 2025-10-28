import { Feature } from "@/monie/classes/feature.class";
import { SystemService } from "@/monie/system.service";
import { Injectable } from "@nestjs/common";
import { GlobalConfig } from "rxjs";

@Injectable()
export class FeatureService {
    constructor(
        private readonly systemService: SystemService,
    ) { }

    getFeatures(tenantId: string): Feature {
        const feature = new Feature();

        this.fullfillFeatureFromEnv(feature);

        if (this.systemService.billingEnabled && tenantId) {
            // todo
        }

        if (this.systemService.enterpriseEnabled) {
            // todo
        }


        return feature;
    }


    private fullfillFeatureFromEnv(feature: Feature) {



    }
}