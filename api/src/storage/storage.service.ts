import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { StorageFactory } from "./storage.factory";
import { ListOptions, StorageType } from "./types/storage.types";
import { BaseStorage } from "./interfaces/base-storage.interface";
import { Readable } from "node:stream";

@Injectable()
export class StorageService {
    private readonly defaultStorageType: StorageType;
    private storageInstance: BaseStorage;

    constructor(
        private readonly configService: ConfigService,
        private readonly storageFactory: StorageFactory,
    ) {
        this.defaultStorageType = this.configService.get<StorageType>('DEFAULT_STORAGE_TYPE', 'local_file');
        this.initializeStorage();
    }

    private initializeStorage(): void {
        try {
            this.storageInstance = this.storageFactory.createStorage(this.defaultStorageType);
        } catch (error) {
            throw error;
        }
    }

    getStorage(): BaseStorage {
        return this.storageInstance;
    }

    /**
     * Dynamically switches to a different storage type
     * @param storageType - The storage type to switch to
     * @returns The new storage type instance
     */
    useStorage(storageType: StorageType): BaseStorage {
        try {
            this.storageInstance = this.storageFactory.createStorage(storageType);
            return this.storageInstance;
        } catch (error) {
            throw error;
        }
    }

    async save(filename: string, data: Buffer | string): Promise<void> {
        return this.storageInstance.save(filename, data);
    }

    // Load entire file content
    async load(filename: string): Promise<Buffer> {
        return this.storageInstance.load(filename);
    }

    // Load file content as stream
    async loadStream(filename: string): Promise<Readable> {
        return this.storageInstance.loadStream(filename);
    }

    // Copy file to local path
    async copy(filename: string, targetPath: string): Promise<void> {
        return this.storageInstance.copy(filename, targetPath);
    }

    // Check if file exists
    async exists(filename: string): Promise<boolean> {
        return this.storageInstance.exists(filename);
    }

    // Delete file
    async delete(filename: string): Promise<void> {
        return this.storageInstance.delete(filename);
    }

    // list files and directories 
    async list?(dirPath: string, options?: ListOptions): Promise<string[]> {
        if (!this.storageInstance.list) {
            return [];
        }
        return this.storageInstance.list(dirPath, options);
    }
}