export type WorkflowDraft = {
  id: string;
  appId: string;
  tenantId: string;
  type: string;
  graph: Record<string, any>;
  features: Record<string, any>;
  environmentVariables: Array<Record<string, any>>;
  sessionVariables: Array<Record<string, any>>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | null;
  updatedBy?: string | null;
};

export type GetWorkflowDraftResponse = {
  getWorkflowDraft: WorkflowDraft;
};
