import { StreamData } from "./dtos/stream-data.dto";
import { StreamReader } from "./streams/stream";

export abstract class RequestReader implements StreamReader {
  type: string;

  constructor(type: string) {
    this.type = type;
  }

  // abstract readStream(): Generator<StreamData, void, unknown>;

  read(): Promise<any> {
    throw new Error("Method not implemented.");
  }

}