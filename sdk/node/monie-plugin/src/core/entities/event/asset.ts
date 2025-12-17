export class AssetChunk {
  filename: string;
  // base64 encode
  data: string;
  end: boolean;

  constructor(filename: string, data: string, end: boolean) {
    this.filename = filename;
    this.data = data;
    this.end = end;
  }
}

