export enum EmbeddingInputType {
  DOCUMENT = 'document',
  QUERY = 'query'
}

export interface TextEmbeddingResult {
  embeddings: number[][];
  tokens?: number;
  model: string;
  usage?: any;
}
