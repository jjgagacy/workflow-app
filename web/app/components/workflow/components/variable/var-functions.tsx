import { Cloud, FolderTree, MonitorSmartphone, Sparkles, type LucideIcon } from "lucide-react";

export type VariableGroupType = "env" | "session" | "system" | "variable";

export const variableGroupColorMap: Record<VariableGroupType, string> = {
  env: "text-emerald-500",
  session: "text-sky-500",
  system: "text-violet-500",
  variable: "text-slate-500",
};

export const getVariableGroupColor = (groupType: VariableGroupType = "variable") => {
  return variableGroupColorMap[groupType] ?? variableGroupColorMap.variable;
};

export const getVariableGroupType = (nodeId?: string): VariableGroupType => {
  const normalized = (nodeId || "").toLowerCase();

  if (normalized.includes("env")) return "env";
  if (normalized.includes("session")) return "session";
  if (normalized.includes("system")) return "system";

  return "variable";
};

export const getVariableTypeImage = (nodeId?: string): LucideIcon => {
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

export const renderVariableTypeImage = (nodeId?: string, className = "h-3 w-3") => {
  const Icon = getVariableTypeImage(nodeId);
  const groupType = getVariableGroupType(nodeId);

  return renderVariableByGroup(groupType, className);
};

export const renderVariableByGroup = (groupType: VariableGroupType, className = "h-3 w-3") => {
  const Icon = getVariableTypeImage(groupType);
  return <Icon className={`${className}`} />;
};
