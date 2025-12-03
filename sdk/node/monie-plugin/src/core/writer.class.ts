import { Writer } from "@/server/server";

export abstract class ResponseWriter implements Writer {

  write(data: string): void {
    process.stdout.write(data);
  }

  close(): void {
    throw new Error("Method not implemented.");
  }
}