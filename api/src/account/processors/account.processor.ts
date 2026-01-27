import { BillingService } from "@/service/billing/billing.service";
import { Process, Processor } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Job } from "bull";

@Processor('account')
@Injectable()
export class AccountProcessor {
  constructor(
    private readonly billingService: BillingService
  ) { }

  @Process('account_delete')
  async handleAccountDelete(job: Job) {
    console.log(`Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}...`);
    const { id } = job.data;
    this.billingService.deleteAccount(id);
  }
}
