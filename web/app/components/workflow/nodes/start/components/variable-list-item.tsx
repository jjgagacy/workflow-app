import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { FormVariable } from "../../../types";

type VariableListItemProps = {
  item: FormVariable;
  index: number;
  totalCount: number;
  onMove: (id: string, direction: "up" | "down") => void;
  onDelete: (id: string) => void;
  onEdit: (item: FormVariable) => void;
};

export const VariableListItem = React.memo(({ item, index, totalCount, onMove, onDelete, onEdit }: VariableListItemProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-[var(--border)] bg-background px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-semibold text-foreground">{item.label}</div>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
              {item.type}
            </span>
            {item.required && (
              <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] text-red-500 dark:bg-red-900/20">
                {t("workflow.startPanel.required")}
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{item.name}</div>

          {typeof item.default !== "undefined" && item.default !== "" && (
            <div className="mt-2 text-xs text-muted-foreground">
              {t("workflow.startPanel.default")}: {String(item.default)}
            </div>
          )}

          {!!item.options?.length && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.options.map((opt) => (
                <span key={opt.id} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                  {opt.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-[var(--border)] hover:bg-muted/70 hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMove(item.id, "up")}
            disabled={index === 0}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-[var(--border)] hover:bg-muted/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(item.id, "down")}
            disabled={index === totalCount - 1}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-[var(--border)] hover:bg-muted/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-[var(--border)] hover:bg-muted/70 hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

VariableListItem.displayName = "VariableListItem";