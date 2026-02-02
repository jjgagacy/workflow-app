import { RequestReader } from "../reader.class.js";
import { ResponseWriter } from "../writer.class.js";

export interface StreamReader {
  read(data: any): Promise<any>;
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
