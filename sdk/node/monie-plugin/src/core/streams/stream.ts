import { RequestReader } from "../reader.class";
import { ResponseWriter } from "../writer.class";

export interface StreamReader {
  read(): Promise<any>;
  stop(): Promise<void>;
}

export interface StreamWriter {
  write(data: any): Promise<void>;
  close(): Promise<void>;
}

export interface StreamPair {
  reader: RequestReader;
  writer: ResponseWriter;
}
