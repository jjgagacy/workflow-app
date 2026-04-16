import { Module } from '@nestjs/common';
import { AppsService } from './apps.service';
import { InstalledAppService } from './installed-app.service';

@Module({
  imports: [],
  providers: [AppsService, InstalledAppService],
  exports: [],
})
export class AppsModule { }
