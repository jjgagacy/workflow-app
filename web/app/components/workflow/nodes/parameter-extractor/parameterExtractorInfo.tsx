import React from 'react';
import { useTranslation } from 'react-i18next';

interface ParameterExtractorInfoProps {
  label?: string;
  modelLabel: string;
  parameterCount: number;
  enableVision: boolean;
  className?: string;
}

export const ParameterExtractorInfo = ({
  label,
  modelLabel,
  parameterCount,
  enableVision,
  className = ""
}: ParameterExtractorInfoProps) => {
  const { t } = useTranslation();

  return (
    <div className={`px-3 pb-3 ${className}`}>
      <div className="rounded-lg bg-muted/20 px-3 py-2 space-y-1.5">
        <div className="text-sm font-semibold text-foreground">
          {label?.trim() || t('workflow.nodes.parameter-extractor.name')}
        </div>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="font-medium text-foreground">
              {modelLabel || t('workflow.nodes.parameter-extractor.no_models')}
            </span>
            <span className="text-muted-foreground/20">·</span>
            <span className="flex items-center gap-0.5">
              <span className="font-medium text-foreground">{parameterCount}</span>
              <span>{t('workflow.nodes.parameter-extractor.parameters')}</span>
            </span>
            <span className="text-muted-foreground/20">·</span>
            <span className={enableVision ? "text-blue-500" : "text-muted-foreground"}>
              {enableVision
                ? t('workflow.nodes.parameter-extractor.vision')
                : t('workflow.nodes.parameter-extractor.no_vision')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParameterExtractorInfo;