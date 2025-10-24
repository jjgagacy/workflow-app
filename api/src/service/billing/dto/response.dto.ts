class BaseSuccessResponse {
    success: boolean;
    code: number;
    message: string;
    data: any;
}

export class EmailFreezeResponseDto {
    in_freeze: boolean;
}

export class VoucherInfo {

}

export class InvoiceResponseDto {
    invoices: VoucherInfo[];
}

export class SubscriptionResponseDto {
    payment_link: string;
}