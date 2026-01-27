import { MonieConfig } from "@/monie/monie.config";
import { Injectable } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import { BillingApiService } from "./billing-api.service";
import { GlobalLogger } from "@/logger/logger.service";
import { getErrorDetails } from "@/common/utils/error";
import { EmailFreezeResponseDto, VoucherInfo, InvoiceResponseDto, SubscriptionResponseDto } from "./dto/response.dto";
import { GetTenantInfoRequestDto, SubscriptionRequestDto } from "./dto/request.dto";
import { InternalServerGraphQLException } from "@/common/exceptions";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { Billing } from "@/monie/classes/feature.class";

@Injectable()
export class BillingService {
  private baseUrl: string;
  private secretKey: string;
  private apiService: BillingApiService;

  constructor(
    private readonly monieConfig: MonieConfig,
    private readonly httpService: HttpService,
    private readonly logger: GlobalLogger,
    private readonly i18n: I18nService<I18nTranslations>
  ) {
    this.baseUrl = this.monieConfig.billingApiUrl();
    this.secretKey = this.monieConfig.billingAPISecretKey();
    this.apiService = new BillingApiService(this.httpService, this.baseUrl, this.secretKey);
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

  // Check if email is in freeze
  async isEmailInFreeze(email: string): Promise<boolean> {
    const response = await this.handleRequest<EmailFreezeResponseDto>('/account/in-freeze', undefined, { email });
    return response?.in_freeze || false;
  }

  // Delete account
  async deleteAccount(accountId: number): Promise<void> {
    await this.handleDeleteRequest<void>('/account', undefined, { accountId });
  }

  // Get invoices
  async getInvoices(email: string, tenantId: string): Promise<VoucherInfo[]> {
    const response = await this.handleRequest<InvoiceResponseDto>('/invoices', undefined, { email, tenant_id: tenantId });
    return response?.invoices || [];
  }

  // Get subscription payment link
  async getSubscription(plan: string, interval: string, email: string = '', tenantId: string): Promise<SubscriptionResponseDto> {
    const params: SubscriptionRequestDto = {
      plan,
      interval,
      email,
      tenant_id: tenantId,
    }
    const response = await this.handleRequest<SubscriptionResponseDto>('/subscription/payment-link', undefined, params);

    if (response == null) {
      throw new InternalServerGraphQLException(this.i18n.t('billing.GET_PAYMENT_LINK_ERROR'));
    }
    return response;
  }

  async getTenantSubscription(tenantId: string) {
    const params: GetTenantInfoRequestDto = {
      tenant_id: tenantId,
    };
    const response = await this.handleRequest<Billing>('/subscription/info', undefined, params);

    if (response == null) {
      throw new InternalServerGraphQLException(this.i18n.t('billing.GET_PAYMENT_INFO_ERROR'));
    }
    return response;
  }

}
