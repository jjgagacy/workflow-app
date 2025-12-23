export interface RerankDocument {
  index: number;
  text: string;
  score: number;
}

export class RerankResult {
  model: string;
  docs: RerankDocument[];

  constructor(data: Partial<RerankResult>) {
    Object.assign(this, data);
    this.model = data.model || '';
    this.docs = data.docs || [];
  }
}