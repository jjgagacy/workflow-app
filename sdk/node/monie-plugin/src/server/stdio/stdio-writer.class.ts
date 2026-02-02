import { ResponseWriter } from "@/core/writer.class.js";

export class StdioWriter extends ResponseWriter {
  write(data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      process.stdout.write(String(data), (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  async close(): Promise<void> {
  }
}
