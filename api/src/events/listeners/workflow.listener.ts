import { MonieEvent } from "@/monie/constants/events";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class WorkflowListener {
  @OnEvent(MonieEvent.WORKFLOW_DRAFT_SYNCED)
  async handleWorkflowDraftSyncedEvent(event: any) {
    console.log('handleWorkflowDraftSyncedEvent', event);
  }
}