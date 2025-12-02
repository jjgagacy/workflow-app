import { RequestReader } from "../reader.class";

export class StdioReader extends RequestReader {
  constructor() {
    super("stdio");
  }

}