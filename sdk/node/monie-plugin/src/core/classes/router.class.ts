import type { RouterContract } from "../../interfaces/router.interface";
import { StreamReader, StreamWriter } from "../streams/stream";

export class Router implements RouterContract {
  constructor(
    private reader: StreamReader,
    private writer?: StreamWriter
  ) { }
}