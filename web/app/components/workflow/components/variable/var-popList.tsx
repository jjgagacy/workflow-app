import { useMemo, useState } from "react";
import { Search, Cloud, MonitorSmartphone, Sparkles, FolderTree, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NodeOutputVariable, Variable, VariableSelector } from "../../types";
import { EmptyData } from "@/app/components/base/empty-data";

interface VarSelectorProps {
  variables: NodeOutputVariable[];
  onChange: (variable: Variable, selector: VariableSelector) => void;
  wrapperWidth?: number;
  hideSearch?: boolean;
  searchText?: string;
}

const getVariableGroupType = (nodeId?: string): "env" | "session" | "system" | "other" => {
  const normalized = (nodeId || "").toLowerCase();

  if (normalized.includes("env")) return "env";
  if (normalized.includes("session")) return "session";
  if (normalized.includes("system")) return "system";

  return "other";
};

const getVariableTypeImage = (nodeId?: string): LucideIcon => {
  switch (getVariableGroupType(nodeId)) {
    case "env":
      return Cloud;
    case "session":
      return MonitorSmartphone;
    case "system":
      return Sparkles;
    default:
      return FolderTree;
  }
};

const renderVariableTypeImage = (nodeId?: string, className = "h-3 w-3") => {
  const Icon = getVariableTypeImage(nodeId);
  const groupType = getVariableGroupType(nodeId);

  const colorMap = {
    env: "text-emerald-500",
    session: "text-sky-500",
    system: "text-violet-500",
    other: "text-slate-500",
  } as const;

  return <Icon className={`${className} ${colorMap[groupType]}`} />;
};

export const VarPopList = ({
  variables,
  onChange,
  wrapperWidth,
  hideSearch,
  searchText,
}: VarSelectorProps) => {
  const { t } = useTranslation();
  const [internalSearchValue, setInternalSearchValue] = useState("");
  const searchValue = searchText ?? internalSearchValue;

  const filteredVariables = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    if (!normalizedQuery) {
      return variables.map((group) => ({
        ...group,
        visibleVariables: group.variables,
      }));
    }

    return variables
      .map((group) => {
        const shouldMatchTitle = group.title.toLowerCase().includes(normalizedQuery);
        const visibleVariables = shouldMatchTitle
          ? group.variables
          : group.variables.filter((variable) => {
            const candidateText = [variable.name, variable.label || ""]
              .join(" ")
              .toLowerCase();

            return candidateText.includes(normalizedQuery);
          });

        return {
          ...group,
          visibleVariables,
        };
      })
      .filter((group) => group.visibleVariables.length > 0);
  }, [searchValue, variables]);

  return (
    <div
      className="space-y-2 rounded-md border border-[var(--border)] bg-popover p-1.5 shadow-lg"
      style={{ width: wrapperWidth || 256 }}
    >
      {!variables || variables.length === 0 ? (
        <EmptyData
          title="No available vars"
          description={<div className="text-accent">No vars</div>}
        />
      ) : (
        <>
          {!hideSearch && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchValue}
                onChange={(event) => {
                  if (searchText === undefined) {
                    setInternalSearchValue(event.target.value);
                  }
                }}
                placeholder={t("workflow.nodes.code.search_variable") || "Search variable"}
                className="w-full rounded-md border border-[var(--border)] bg-background py-1.5 pl-8 pr-2 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/60"
              />
            </div>
          )}

          <div className="max-h-[260px] overflow-y-auto pr-1">
            {filteredVariables.length === 0 ? (
              <div className="rounded-md border border-dashed border-[var(--border)] bg-background px-3 py-4 text-center text-xs text-muted-foreground">
                {t("workflow.common.noResults") || "No matching variables"}
              </div>
            ) : (
              filteredVariables.map((group) => {
                const Icon = getVariableTypeImage(group.nodeId);
                const groupType = getVariableGroupType(group.nodeId);

                const groupColorMap = {
                  env: "text-emerald-500",
                  session: "text-sky-500",
                  system: "text-violet-500",
                  other: "text-slate-500",
                } as const;

                return (
                  <div key={group.nodeId} className="mb-2 last:mb-0">
                    <div className="mb-1 flex items-center gap-1.5 px-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                      <Icon className={`h-3.5 w-3.5 ${groupColorMap[groupType]}`} />
                      <span>{group.title}</span>
                    </div>

                    <div className="space-y-1">
                      {group.visibleVariables.map((variable) => (
                        <button
                          key={`${group.nodeId}-${variable.id}`}
                          type="button"
                          onClick={() => onChange(variable, {
                            nodeId: group.nodeId,
                            path: [variable.name],
                          })}
                          className="flex w-full items-center justify-between gap-2 rounded-md border border-transparent bg-background/50 px-2 py-1.5 text-left transition-colors hover:border-[var(--border)] hover:bg-muted/50"
                        >
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-muted/70">
                              {renderVariableTypeImage(group.nodeId, "h-3.5 w-3.5")}
                            </span>
                            <span className="truncate text-[13px] font-medium text-foreground/90">{variable.name}</span>
                          </span>

                          <span className="shrink-0 rounded bg-muted/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {variable.dataType || "string"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};