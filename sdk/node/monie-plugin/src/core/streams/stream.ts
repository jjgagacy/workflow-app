export interface StreamReader {
  read(): Promise<any>;
}

export interface StreamWriter {
  write(data: any): Promise<void>;
  close(): Promise<void>;
}

export interface StreamPair {
  reader: StreamReader;
  writer: StreamWriter;
}
