import { Injectable } from "@nestjs/common";
import { BaseStorage } from "../interfaces/base-storage.interface";
import { Readable } from "stream";
import { ConfigService } from "@nestjs/config";
import { existsSync, mkdirSync, statSync } from "fs";
import { dirname, join } from "path";
import { createReadStream, createWriteStream } from 'node:fs';
import { buffer } from 'stream/consumers';
import { pipeline } from "node:stream/promises";
import { unlink, access, readdir, stat } from "node:fs/promises";
import { ListOptions } from "../types/storage.types";

function ReadableFromBuffer(buffer: Buffer): Readable {
  return Readable.from([buffer], { objectMode: false });
}

function ReadableFromString(text: string): Readable {
  return Readable.from([text], { objectMode: false });
}

/**
 * Local file system storage implementation
 * 
 * Provides file operations using the local file system as the storage backend.
 * Supports basic CURD operations, streaming, and file management functionalities.
 */
@Injectable()
export class LocalFileStorage implements BaseStorage {
  private basePath: string;

  /**
   * Creates a new instance of LocalFileStorage
   * 
   * @param configService 
   */
  constructor(private readonly configService: ConfigService) {
    this.basePath = this.configService.get<string>('LOCAL_STORAGE_PATH', './storage');
    if (!existsSync(this.basePath)) {
      mkdirSync(this.basePath, { recursive: true });
    }
  }

  /**
   * Constructs the full file path from a relative filename
   * 
   * @param filename - The relative filename or path
   * @returns The absolute file path
   */
  getFullPath(filename: string): string {
    return join(this.basePath, filename);
  }

  /**
   * Save data to the local file system
   * 
   * @param filename - The name/path of the file to save
   * @param data - The data to save (Buffer or string)
   * @returns Promise that resolves when the file is successfully saved
   * 
   * @example
   * ```typescript
   * // Save text data
   * await storage.save('document.txt', 'Hello World');
   * 
   * // Save binary data
   * await storage.save('image.jpg', imageBuffer);
   * ```
   */
  async save(filename: string, data: Buffer | string): Promise<void> {
    const fullPath = this.getFullPath(filename);
    const directory = dirname(fullPath);
    // ensure directory exists
    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
    }

    const expectedSize = Buffer.isBuffer(data)
      ? data.length
      : Buffer.byteLength(data, 'utf-8');

    const writeStream = createWriteStream(fullPath);
    try {
      if (Buffer.isBuffer(data)) {
        await pipeline(
          ReadableFromBuffer(data),
          writeStream,
        );
      } else {
        await pipeline(
          ReadableFromString(data),
          writeStream,
        );
      }

      await this.verifySize(filename, expectedSize);
    } catch (error) {
      try {
        if (existsSync(fullPath)) {
          await unlink(fullPath);
        }
      } catch { }
      throw new Error(`Failed to save file: ${(error as Error).message}`);
    }
  }

  protected async getFileSize(filename: string): Promise<number> {
    const fullPath = this.getFullPath(filename);
    try {
      const stats = statSync(fullPath);
      return stats.size;
    } catch (error) {
      throw new Error(`Failed to get file size: ${error.message}`);
    }
  }

  protected async verifySize(filename: string, expectedSize?: number): Promise<void> {
    try {
      const exists = await this.exists(filename);
      if (!exists) {
        throw new Error(`File doesn't exist: ${filename}`);
      }

      if (expectedSize !== undefined) {
        const actualSize = await this.getFileSize(filename);
        if (actualSize !== expectedSize) {
          throw new Error(`File size mismatch: expected ${expectedSize}, got ${actualSize}`);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Loads the entire content of a file into memory
   * 
   * @param filename - The name/path of the file to load
   * @returns Promise that resolves with the file content as Buffer
   * 
   * @example
   * ```typescript
   * const content = await storage.load('document.txt');
   * console.log(content.toString('utf-8'));
   * ```
   */
  async load(filename: string): Promise<Buffer> {
    const fullPath = this.getFullPath(filename);
    const stream = createReadStream(fullPath);
    return await buffer(stream);
  }

  /**
   * Createa a readable stream for large file processing
   * Useful for processing large files without loading them entirely into memory.
   * 
   * @param filename - The name/path of the file to stream
   * @returns Promises that resolves with a Readable stream
   */
  async loadStream(filename: string): Promise<Readable> {
    const fullPath = this.getFullPath(filename);
    try {
      await access(fullPath);
      return createReadStream(fullPath);
    } catch {
      throw new Error(`File not found or inaccessible: ${fullPath}`);
    }
  }

  /**
   * Copy a file to a specified local path
   * Essentially copies a file from storage to another local location
   * 
   * @param filename - The name/path of the file to stream
   * @param targetPath - The destination path where the file should be copied
   */
  async copy(filename: string, targetPath: string): Promise<void> {
    const fullPath = this.getFullPath(filename);

    try {
      const readStream = createReadStream(fullPath);
      const writeStream = createWriteStream(targetPath);

      await pipeline(readStream, writeStream);
    } catch {
      throw new Error(`Cannot copy file: ${fullPath}`);
    }
  }

  /**
   * Checks if a file exists in storage
   * @param filename - The name/path of the file to check
   * @returns Promises that resolves to true if the file exists, false otherwise.
   */
  async exists(filename: string): Promise<boolean> {
    try {
      const fullPath = this.getFullPath(filename);
      await access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Deletes a file from storage
   * @param filename - The name/path of the file to delete
   */
  async delete(filename: string): Promise<void> {
    if (await this.exists(filename)) {
      await unlink(this.getFullPath(filename));
    }
  }

  /**
   * List a directory and returns its contents
   * Supports filtering for files only, directories only, or both.
   * @param dirPath - The directory path to lscan (relative to basePath)
   * @param options - Scanning options to filter results
   * @returns Promises that resolves with an array of item paths
   */
  async list(dirPath: string, options?: ListOptions): Promise<string[]> {
    const fullPath = this.getFullPath(dirPath);

    try {
      const items = await readdir(fullPath);
      const result: string[] = [];

      for (const item of items) {
        const itemPath = join(fullPath, item);
        const stats = await stat(itemPath);

        if (stats.isFile() && options?.files) {
          result.push(join(dirPath, item));
        } else if (stats.isDirectory() && options?.directories) {
          result.push(join(dirPath, item));
        }
      }

      return result;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return []; // 目录不存在，返回空数组
      }
      throw new Error(`Failed to list directory "${dirPath}": ${(error as Error).message}`);
    }
  }
}

