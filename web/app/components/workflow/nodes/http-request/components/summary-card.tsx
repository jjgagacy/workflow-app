import { useTranslation } from "react-i18next";
import type { HttpBodyType, HttpMethod } from "../types";

type SummaryCardProps = {
  label?: string;
  method: HttpMethod;
  bodyType: HttpBodyType;
  outputVariableName: string;
};

const SummaryCard = ({ label, method, bodyType, outputVariableName }: SummaryCardProps) => {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg bg-muted/20 px-4 py-3">
      <div className="text-sm font-semibold text-foreground">{label?.trim() || t('workflow.nodes.http-request.name')}</div>
      <div className="mt-1 text-xs leading-5 text-muted-foreground">
        {t('workflow.nodes.http-request.description2')}
      </div>
    </div>
  );
};

export default SummaryCard;
