import { IsOptional } from "class-validator";

export class I18nObject {
  zh_Hans: string = "";
  en_US: string = "";

  [key: string]: string;

  constructor(data: { en_US: string; zh_Hans?: string } & Record<string, string>) {
    this.zh_Hans = data.zh_Hans || '';
    this.en_US = data.en_US;

    Object.keys(data).forEach(key => {
      if (key !== 'en_US' && key !== 'zh_Hans' && typeof data[key] === 'string') {
        this[key] = data[key];
      }
    });

    if (!this.zh_Hans) {
      this.zh_Hans = this.en_US;
    }
  }
}

export class PriceConfig {
  input: number;
  @IsOptional()
  output?: number;
  unit: number;
  currency: string;
}

export class PriceInfo {
  unit_price: number;
  unit: number;
  totalAmount: number;
  currency: string;

  constructor(init?: Partial<PriceInfo>) {
    this.unit_price = 0;
    this.unit = 1;
    this.totalAmount = 0;
    this.currency = 'USD';

    if (init) {
      Object.assign(this, init);
    }
  }
}

