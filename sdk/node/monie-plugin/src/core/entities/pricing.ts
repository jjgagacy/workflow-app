export class PriceConfig {
  input: number;
  output?: number | undefined;
  unit: number;
  currency: string;

  constructor(data: Partial<PriceConfig> = {}) {
    this.input = data.input || 0;
    this.output = data.output || undefined;
    this.unit = data.unit || 0;
    this.currency = data.currency || '';
  }
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


