import { IsOptional } from "class-validator";

export class I18nObject {
    [key: string]: string;
}

export class PriceConfig {
    input: number;

    @IsOptional()
    ouput?: number;

    unit: number;

    currency: string;
}

export class PriceInfo {
    unit_price: number;

    unit: number;

    total_amount: number;

    currency: string;

    constructor(init?: Partial<PriceInfo>) {
        this.unit_price = 0;
        this.unit = 1;
        this.total_amount = 0;
        this.currency = 'USD';

        if (init) {
            Object.assign(this, init);
        }
    }
}

