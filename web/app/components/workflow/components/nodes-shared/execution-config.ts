export type WorkflowNodeErrorResponse = 'stop-workflow' | 'terminate-on-error' | 'remove-on-error';

export const WORKFLOW_NODE_ERROR_RESPONSE_OPTIONS: Array<{
  value: WorkflowNodeErrorResponse;
  label: string;
  description: string;
}> = [
    {
      value: 'stop-workflow',
      label: '停止工作流',
      description: '任一项出错时立即停止整个工作流。',
    },
    {
      value: 'terminate-on-error',
      label: '错误时终止',
      description: '终止当前迭代执行并返回错误。',
    },
    {
      value: 'remove-on-error',
      label: '错误时移除',
      description: '跳过失败项，仅保留成功结果。',
    },
  ];