import { NodeProps } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import type { CodeNodeData } from "./types";
import { cn } from "@/utils/classnames";
import { ArrowRight, RotateCcw, AlertCircle } from "lucide-react";

const CodeNode = ({ id, data }: NodeProps<Node<CodeNodeData>>) => {
  const { t } = useTranslation();
  const label = data.label?.trim() || 'Code';
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const inputCount = data.inputs?.length ?? 0;
  const outputCount = Object.keys(data.outputs ?? {}).length;
  const retryOnFailure = Boolean(data.retryOnFailure);
  const exceptionStrategy = data.exceptionStrategy || 'stop-execution';

  const exceptionLabel = exceptionStrategy === 'return-default'
    ? t('workflow.errorHandler.stopExecution')
    : t('workflow.errorHandler.returnDefault');

  return (
    <div className="code-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="px-3 pb-3">
            <div className="rounded-lg bg-muted/20 px-3 py-2 text-xs space-y-1.5">
              {/* 第一行：输入 → 输出 */}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <span className="font-medium text-foreground">{inputCount}</span>
                  <span className="text-muted-foreground">{t('workflow.nodes.code.in')}</span>
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground/30" />
                <span className="flex items-center gap-1">
                  <span className="font-medium text-foreground">{outputCount}</span>
                  <span className="text-muted-foreground">{t('workflow.nodes.code.out')}</span>
                </span>
                <span className="text-muted-foreground/20">|</span>
                <span className={cn(
                  "flex items-center gap-1",
                  retryOnFailure ? "text-blue-500" : "text-muted-foreground"
                )}>
                  <RotateCcw className={cn("h-3 w-3", !retryOnFailure && "opacity-30")} />
                  <span>{retryOnFailure ? '重试' : '不重试'}</span>
                </span>
              </div>
              {/* 第二行：异常处理 */}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <AlertCircle className="h-3 w-3 text-muted-foreground/50" />
                <span className="text-muted-foreground/60">异常</span>
                <span className="text-muted-foreground/20">·</span>
                <span>{exceptionLabel}</span>
              </div>
            </div>
          </div>
          <NodeSourceHandle nodeId={id} handleId="output" />
        </>
      )}
    </div>
  );
};

export default CodeNode;