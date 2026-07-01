import { useTranslation } from "react-i18next";
import { WORKFLOW_NODE_ERROR_RESPONSE_OPTIONS } from "../../components/nodes-shared/execution-config";
import type { WorkflowNodeErrorResponse } from "../../components/nodes-shared/execution-config";

type IterationSummaryProps = {
  label?: string;
  parallelCount: number;
  errorResponse: WorkflowNodeErrorResponse;
  flat: boolean;
};

const IterationSummary = ({ label, parallelCount, errorResponse, flat }: IterationSummaryProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg bg-muted/20 px-3 py-2">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground truncate">
            {label?.trim() || t('workflow.nodes.iteration.name')}
          </div>
        </div>
        <div className="flex items-center divide-x divide-muted-foreground/20 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 pr-2">
            <span className="font-medium text-foreground">{parallelCount}</span>
            <span className="text-[10px]">{t('workflow.iteration.parallel')}</span>
          </span>
          <span className="flex items-center gap-1.5 px-2">
            <span className="truncate max-w-[80px]">
              {WORKFLOW_NODE_ERROR_RESPONSE_OPTIONS.find((option) => option.value === errorResponse)?.label || t('workflow.iteration.stop')}
            </span>
          </span>
          <span className="flex items-center gap-1.5 pl-2">
            <span>{flat ? t('workflow.iteration.flat') : t('workflow.iteration.nested')}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default IterationSummary;