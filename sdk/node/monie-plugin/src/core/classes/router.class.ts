import type { RouterContract } from "../../interfaces/router.interface";
import { RequestReader } from "../reader.class";
import { StreamReader, StreamWriter } from "../streams/stream";
import { ResponseWriter } from "../writer.class";

export class Router implements RouterContract {
  constructor(
    private reader: RequestReader,
    private writer?: ResponseWriter
  ) { }
}