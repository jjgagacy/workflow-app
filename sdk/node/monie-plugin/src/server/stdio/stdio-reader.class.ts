import { RequestReader } from "../../core/reader.class";

export class StdioReader extends RequestReader {

  constructor() {
    super("stdio");
  }

}