import { Injectable } from "@nestjs/common";
import { StorageType } from "./types/storage.types";
import { BaseStorage } from "./interfaces/base-storage.interface";
import { LocalFileStorage } from "./implements/local-file.storage";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class StorageFactory {
    constructor(private readonly configService: ConfigService) { }

    createStorage(storageType: StorageType): BaseStorage {
        switch (storageType) {
            case 'local_file':
                return new LocalFileStorage(this.configService);
            default:
                throw new Error(`Unsupported storage type: ${storageType}`);
        }
    }
}
