import { Module } from "@nestjs/common";
import { LocalFileStorage } from "./implements/local-file.storage";
import { StorageFactory } from "./storage.factory";
import { StorageService } from "./storage.service";
import { OpenDALStorage } from "./implements/opendal.storage";

@Module({
  imports: [],
  providers: [
    StorageFactory,
    LocalFileStorage,
    StorageService,
    OpenDALStorage
  ],
  exports: [
    StorageFactory,
    LocalFileStorage,
    StorageService,
    OpenDALStorage
  ],
})
export class StorageModule { }
