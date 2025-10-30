import { Module } from "@nestjs/common";
import { LocalFileStorage } from "./implements/local-file.storage";
import { StorageFactory } from "./storage.factory";

@Module({
    imports: [],
    providers: [
        StorageFactory,
        LocalFileStorage
    ],
    exports: [
        StorageFactory,
        LocalFileStorage
    ],
})
export class StorageModule { }
