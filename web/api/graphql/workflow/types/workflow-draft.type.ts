export type WorkflowDraft = {
  id: string;
  appId: string;
  tenantId: string;
  type: string;
  graph: Record<string, any>;
  features: Record<string, any>;
  environmentVariables: Record<string, any>;
  sessionVariables: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | null;
  updatedBy?: string | null;
};

export type GetWorkflowDraftResponse = {
  getWorkflowDraft: WorkflowDraft;
};
