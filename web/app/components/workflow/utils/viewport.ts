export const WORKFLOW_VIEWPORT_EVENT = 'workflow:viewport-control';

export type WorkflowViewportAction = 'fit-view' | 'zoom-in' | 'zoom-out' | 'reset-zoom';

export const dispatchWorkflowViewportAction = (action: WorkflowViewportAction) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent<WorkflowViewportAction>(WORKFLOW_VIEWPORT_EVENT, { detail: action }));
};