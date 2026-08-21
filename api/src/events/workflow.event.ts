export class WorkflowSyncDraftEvent {
  constructor(
    public appId: string,
    public workflowId: string,
  ) { }
}