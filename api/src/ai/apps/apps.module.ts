import { Module } from '@nestjs/common';
import { AppsService } from './apps.service';

@Module({
  imports: [],
  providers: [AppsService],
  exports: [],
})
export class AppsModule { }
