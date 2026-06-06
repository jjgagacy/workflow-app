import { NodeProps } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import type { CodeNodeData } from "./types";

const CodeNode = ({ id, data }: NodeProps<Node<CodeNodeData>>) => {
  const { t } = useTranslation();
  const label = data.label?.trim() || 'Code';
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const inputCount = data.inputParameters?.length ?? 0;
  const outputCount = data.outputVariables?.length ?? 0;
  const retryOnFailure = Boolean(data.retryOnFailure);
  const exceptionStrategy = data.exceptionStrategy || 'stop-execution';

  return (
    <div className="code-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="space-y-2 p-4">
            <div className="rounded-lg border border-[var(--border)] bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-background px-2.5 py-1">
                  输入参数 {inputCount}
                </span>
                <span className="rounded-full bg-background px-2.5 py-1">
                  输出变量 {outputCount}
                </span>
                <span className="rounded-full bg-background px-2.5 py-1">
                  {retryOnFailure ? '失败重试开启' : '失败不重试'}
                </span>
              </div>
              <div className="mt-2 truncate">
                {exceptionStrategy === 'return-default'
                  ? '异常处理: 默认值返回'
                  : '异常处理: 停止执行'}
              </div>
            </div>
            <div className="rounded-lg border border-dashed border-[var(--border)] bg-background px-3 py-2 text-xs text-muted-foreground">
              {t('workflow.nodes.code.description', { defaultValue: '执行自定义代码并输出结果。' })}
            </div>
          </div>
          <NodeSourceHandle nodeId={id} handleId="output" />
        </>
      )}
    </div>
  );
};

export default CodeNode;
