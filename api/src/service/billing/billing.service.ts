import { MonieConfig } from "@/monie/monie.config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class BillingService {
    private baseUrl: string;
    private secretKey: string;

    constructor(
        private readonly monieConfig: MonieConfig
    ) {
        this.baseUrl = monieConfig.billingApiUrl();
        this.secretKey = monieConfig.billingAPISecretKey();
    }






}