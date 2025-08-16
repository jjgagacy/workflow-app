import { Module } from "@nestjs/common";
import { FooService } from "./foo.service";

@Module({
    imports: [],
    controllers: [],
    providers: [FooService],
    exports: [FooService]
})
export class FooModule {}