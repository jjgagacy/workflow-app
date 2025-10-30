import { Module } from "@nestjs/common";
import { LocalFileStorage } from "./implements/local-file.storage";
import { StorageFactory } from "./storage.factory";
import { StorageService } from "./storage.service";

@Module({
    imports: [],
    providers: [
        StorageFactory,
        LocalFileStorage,
        StorageService,
    ],
    exports: [
        StorageFactory,
        LocalFileStorage,
        StorageService,
    ],
})
export class StorageModule { }
