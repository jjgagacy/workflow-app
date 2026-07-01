import { useTranslation } from "react-i18next";

interface BranchLogicInfoProps {
  decisionBranchCount: number;
  resolvedOutputHandleCount: number;
  className?: string;
}

const BranchLogicInfo = ({
  decisionBranchCount,
  resolvedOutputHandleCount,
  className = ""
}: BranchLogicInfoProps) => {
  const { t } = useTranslation();

  return (
    <div className={`rounded-lg bg-muted/20 px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-foreground">
            {t('workflow.conditions.branchLogic')}
          </div>
          <div className="text-xs text-muted-foreground">
            {t('workflow.conditions.branchLogicDescription')}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="rounded-full bg-background px-2.5 py-0.5 text-xs font-medium text-foreground">
            {decisionBranchCount}
          </span>
          <span className="text-xs text-muted-foreground/50">·</span>
          <span className="rounded-full bg-background px-2.5 py-0.5 text-xs font-medium text-foreground">
            {resolvedOutputHandleCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BranchLogicInfo;