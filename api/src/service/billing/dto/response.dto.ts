class BaseSuccessResponse {
  success: boolean;
  code: number;
  message: string;
  data: any;

  constructor(success: boolean, code: number, message: string, data: any = null) {
    this.success = success;
    this.code = code;
    this.message = message;
    this.data = data;
  }
}

export class EmailFreezeResponseDto {
  in_freeze!: boolean;
}

export class VoucherInfo {
}

export class InvoiceResponseDto {
  invoices: VoucherInfo[] = [];
}

export class SubscriptionResponseDto {
  payment_link: string = '';
}
