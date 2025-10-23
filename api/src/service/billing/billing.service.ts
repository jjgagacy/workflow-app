import { MonieConfig } from "@/monie/monie.config";
import { Injectable } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import { BillingApiService } from "./billing-api.service";
import { GlobalLogger } from "@/logger/logger.service";
import { getErrorDetails } from "@/common/utils/error";
import { response } from "express";
import { EmailFreezeResponse } from "./dto/billing-response.dto";

@Injectable()
export class BillingService {
    private baseUrl: string;
    private secretKey: string;
    private apiService: BillingApiService;

    constructor(
        private readonly monieConfig: MonieConfig,
        private readonly httpService: HttpService,
        private readonly logger: GlobalLogger,
    ) {
        this.baseUrl = monieConfig.billingApiUrl();
        this.secretKey = monieConfig.billingAPISecretKey();
        this.apiService = new BillingApiService(httpService, this.baseUrl, this.secretKey);
    }

    async isEmailInFreeze(email: string): Promise<boolean> {
        try {
            const response = await this.apiService.getData<EmailFreezeResponse>('/account/in-freeze', undefined, { email });
            return response.in_freeze;
        } catch (error) {
            this.logger.error('Request isEmailInFreeze', getErrorDetails(error));
            return false;
        }
    }





}