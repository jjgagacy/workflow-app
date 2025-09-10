import { Module } from '@nestjs/common';
import { ModelTypeService } from './model-type.service';

@Module({
    providers: [ModelTypeService],
    exports: [ModelTypeService]
})
export class ModelRuntimeModule {}
