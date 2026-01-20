import { Injectable } from '@nestjs/common';
import { BaseStorage } from '../interfaces/base-storage.interface';
import { Readable } from 'stream';
import { ListOptions } from '../types/storage.types';
import { ConfigService } from '@nestjs/config';
import * as opendal from 'opendal';

@Injectable()
export class OpenDALStorage implements BaseStorage {
  private operator: opendal.Operator;
  private scheme: string;

  constructor(private readonly configService: ConfigService) {
    this.scheme = this.configService.get<string>(
      'storage.opendal.scheme',
      'fs',
    );
    this.operator = new opendal.Operator(
      this.scheme,
      this.buildConfig(this.scheme),
    );
    // const timeout = new opendal.TimeoutLayer();
    // timeout.timeout = 10000; // 10 seconds for non-IO operations (ms)
    // timeout.ioTimeout = 3000; // 3 seconds for IO operations (ms)
    // this.operator.layer(timeout.build());

    // const retry = new opendal.RetryLayer();
    // retry.maxTimes = 3;
    // retry.factor = 2;
    // retry.jitter = true;
    // this.operator.layer(retry.build());
  }

  private buildConfig(scheme: string): Record<string, any> {
    const cfg = this.configService.get<Record<string, any>>(
      `storage.opendal.${scheme}`,
      {},
    );
    if (!cfg || typeof cfg !== 'object') {
      throw new Error(`OpenDAL config not found for scheme: ${scheme}`);
    }

    return this.normalizeKeys(cfg);
  }

  private normalizeKeys(obj: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, v]) => typeof v !== undefined)
        .map(([k, v]) => [k.replace(/[A-Z]/g, (m) => `_${m.toLowerCase}`), v]),
    );
  }

  async save(filename: string, data: Buffer | string): Promise<void> {
    await this.operator.write(filename, data);
  }

  async load(filename: string): Promise<Buffer> {
    return Buffer.from(await this.operator.read(filename));
  }

  async loadStream(filename: string): Promise<Readable> {
    const exists = await this.operator.exists(filename);
    if (!exists) {
      throw new Error(`Source file not found: ${filename}`);
    }

    const data = await this.operator.read(filename);
    return Readable.from(Buffer.from(data));
  }

  async copy(filename: string, targetPath: string): Promise<void> {
    const exists = await this.operator.exists(filename);
    if (!exists) {
      throw new Error(`Source file not found: ${filename}`);
    }

    const data = await this.operator.read(filename);
    await this.operator.write(targetPath, data);
  }

  async exists(filename: string): Promise<boolean> {
    return this.operator.exists(filename);
  }

  async delete(filename: string): Promise<void> {
    if (await this.exists(filename)) {
      await this.operator.delete(filename);
    }
  }

  async list?(
    dirPath: string,
    options: ListOptions = { files: true },
  ): Promise<string[]> {
    const exists = await this.operator.exists(dirPath);
    if (!exists) {
      throw new Error(`Directory not found: ${dirPath}`);
    }
    const { files = false, directories = false } = options;
    if (!files && !directories) {
      throw new Error('At least one of files or directories must be true');
    }

    const entries = await this.operator.list(dirPath, { recursive: true });
    return entries
      .filter((entry: any) => {
        const isDir = entry.path().endsWith('/');
        return (files && !isDir) || (directories && isDir);
      })
      .map((entry: any) => entry.path());
  }
}
