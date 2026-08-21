import { Module } from '@nestjs/common';
import { AppsService } from './apps.service';
import { InstalledAppService } from './installed-app.service';
import { WorkflowService } from '../workflow/workflow.service';

@Module({
  imports: [],
  providers: [AppsService, InstalledAppService, WorkflowService],
  exports: [],
})
export class AppsModule { }
