import type { RequestReaderInterface } from "../interfaces/io.interface";

export class RequestReader implements RequestReaderInterface {
  type: string;

  constructor(type: string) {
    this.type = type;
  }

}