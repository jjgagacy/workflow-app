import { ArrowDown, ArrowUp, Trash2, GripVertical, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TitleInput } from "../../../panel/components/title-input";

type BranchHeaderProps = {
  branchId: string;
  branchTitle: string;
  isDefault: boolean;
  index: number;
  disableMoveUp: boolean;
  disableMoveDown: boolean;
  disableRemoveBranch: boolean;
  onBranchNameChange: (value: string, branchIndex: number, isDefault?: boolean) => void;
  onMoveBranch: (branchId: string, direction: "up" | "down") => void;
  onRemoveBranch: (branchId: string) => void;
};

export const BranchHeader = ({
  branchId,
  branchTitle,
  isDefault,
  index,
  disableMoveUp,
  disableMoveDown,
  disableRemoveBranch,
  onBranchNameChange,
  onMoveBranch,
  onRemoveBranch,
}: BranchHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="group relative flex items-center gap-3 rounded-lg border border-transparent bg-muted/10 px-2 py-1.5 transition-colors hover:border-muted/30 hover:bg-muted/20">
      {/* 拖拽手柄提示 */}
      <div className="flex h-8 w-5 shrink-0 items-center justify-center text-muted-foreground/20 transition-colors group-hover:text-muted-foreground/40">
        <GripVertical className="h-3.5 w-3.5" />
      </div>

      {/* 分支序号或默认标识 */}
      {isDefault ? (
        <div className="flex h-6 shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
          <Shield className="h-3 w-3" />
          <span>{t("workflow.conditions.default")}</span>
        </div>
      ) : (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-muted bg-background text-[10px] font-medium text-muted-foreground">
          {index + 1}
        </div>
      )}

      {/* 标题输入 */}
      <div className="min-w-0 flex-1">
        <TitleInput
          title={branchTitle}
          onChange={(value) => onBranchNameChange(value, index, isDefault)}
          className="border-0 border-b border-transparent bg-transparent px-0 text-sm font-medium transition-colors placeholder:text-muted-foreground/40 hover:border-muted/30 focus:border-primary focus:outline-none"
          placeholder={isDefault ? t("workflow.conditions.defaultBranch") : t("workflow.conditions.branchName")}
        />
      </div>

      {/* 操作按钮组 - hover 显示 */}
      <div className="flex items-center gap-0.5 rounded-lg bg-background/50 p-0.5 opacity-0 shadow-sm transition-all group-hover:opacity-100">
        {!isDefault && (
          <>
            <button
              type="button"
              disabled={disableMoveUp}
              onClick={() => onMoveBranch(branchId, "up")}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
              aria-label={t("workflow.conditions.moveBranchUp")}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={disableMoveDown}
              onClick={() => onMoveBranch(branchId, "down")}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
              aria-label={t("workflow.conditions.moveBranchDown")}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <div className="h-5 w-px bg-muted" />
          </>
        )}
        <button
          type="button"
          disabled={disableRemoveBranch}
          onClick={() => onRemoveBranch(branchId)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
          aria-label={t("workflow.conditions.removeBranch")}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};