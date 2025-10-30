import { Module } from "@nestjs/common";
import { EncryptionService } from "./encryption.service";

@Module({
    imports: [],
    providers: [EncryptionService],
    exports: [],
})
export class EncryptionModule { }
