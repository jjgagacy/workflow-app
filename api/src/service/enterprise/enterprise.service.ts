import { Injectable } from "@nestjs/common";
import { EnterpriseApiService } from "./enterprise-api.service";
import { MonieConfig } from "@/monie/monie.config";
import { HttpService } from "@nestjs/axios";
import { GlobalLogger } from "@/logger/logger.service";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { getErrorDetails } from "@/common/utils/error";
import { InternalServerGraphQLException } from "@/common/exceptions";
import { Enterprise } from "@/monie/classes/enterprise.class";

@Injectable()
export class EnterpriseService {
    private baseUrl: string;
    private secretKey: string;
    private apiService: EnterpriseApiService;

    constructor(
        private readonly monieConfig: MonieConfig,
        private readonly httpService: HttpService,
        private readonly logger: GlobalLogger,
        private readonly i18n: I18nService<I18nTranslations>
    ) {
        this.baseUrl = this.monieConfig.enterpriseApiUrl();
        this.secretKey = this.monieConfig.enterpriseAPISecretKey();
        this.apiService = new EnterpriseApiService(this.httpService, this.baseUrl, this.secretKey);
    }

    private async handleRequest<T>(
        url: string,
        data?: any,
        params?: any,
    ): Promise<T | null> {
        try {
            const response = await this.apiService.getData<T>(url, data, params);
            return response;
        } catch (error) {
            this.logger.error(`Request ${url} error`, getErrorDetails(error));
            return null;
        }
    }

    private async handlePostRequest<T>(
        url: string,
        data?: any,
        params?: any,
    ): Promise<T | null> {
        try {
            const response = await this.apiService.postData<T>(url, data, params);
            return response;
        } catch (error) {
            this.logger.error(`Request ${url} error`, getErrorDetails(error));
            return null;
        }
    }

    private async handleDeleteRequest<T>(
        url: string,
        data?: any,
        params?: any,
    ): Promise<T | null> {
        try {
            const response = await this.apiService.deleteData<T>(url, data, params);
            return response;
        } catch (error) {
            this.logger.error(`Request ${url} error`, getErrorDetails(error));
            return null;
        }
    }

    async getEnterpriseInfo(): Promise<Enterprise> {
        const response = await this.handleRequest<Enterprise>('/info', undefined, undefined);

        if (response == null) {
            throw new InternalServerGraphQLException(this.i18n.t('billing.GET_PAYMENT_INFO_ERROR'));
        }
        return response;
    }

}
