import { ResponseWriter } from "@/core/writer.class";

export class StdioWriter extends ResponseWriter {
  write(data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      process.stdout.write(String(data), (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  close(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
