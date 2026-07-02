import { useTranslation } from "react-i18next";
import type { LLMNodeData } from "../types";

type PanelHeaderProps = {
  label?: LLMNodeData["label"];
};

export const PanelHeader = ({ label }: PanelHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg bg-muted/20 px-4 py-3">
      <div className="text-sm font-semibold text-foreground">{label?.trim() || t("workflow.nodes.llm.name")}</div>
      <div className="mt-1 text-xs leading-5 text-muted-foreground">
        {t("workflow.nodes.llm.description2")}
      </div>
    </div>
  );
};
