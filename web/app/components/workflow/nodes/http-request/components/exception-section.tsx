import { SimpleSelect } from "@/app/ui/select";
import { NodeTextarea } from "../../../components/base/node-textarea";
import type { HttpExceptionStrategy } from "../types";
import type { SelectItem } from "./types";
import { useTranslation } from "react-i18next";

type ExceptionSectionProps = {
  exceptionStrategy: HttpExceptionStrategy;
  exceptionStrategyItems: SelectItem[];
  exceptionDefaultValue: string;
  onExceptionStrategyChange: (value: HttpExceptionStrategy) => void;
  onExceptionDefaultValueChange: (value: string) => void;
};

const ExceptionSection = ({
  exceptionStrategy,
  exceptionStrategyItems,
  exceptionDefaultValue,
  onExceptionStrategyChange,
  onExceptionDefaultValueChange,
}: ExceptionSectionProps) => {
  const { t } = useTranslation();
  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.http-request.exceptionHandler')}</div>
      <SimpleSelect
        items={exceptionStrategyItems}
        defaultValue={exceptionStrategy}
        allowSearch={false}
        className="w-full"
        onSelect={(item) => onExceptionStrategyChange(item.value as HttpExceptionStrategy)}
      />

      {exceptionStrategy === "return-default" && (
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.http-request.returnDefaultValue')}</div>
          <NodeTextarea
            value={exceptionDefaultValue}
            onChange={(event) => onExceptionDefaultValueChange(event.target.value)}
            placeholder=""
            rows={3}
            className="min-h-[88px]"
          />
        </label>
      )}
    </section>
  );
};

export default ExceptionSection;
