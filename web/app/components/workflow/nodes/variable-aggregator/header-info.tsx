import React from 'react';
import { useTranslation } from 'react-i18next';

interface VariableAggregatorInfoProps {
  label?: string;
  variableCount: number;
  outputName: string;
  className?: string;
}

export const VariableAggregatorHeaderInfo = ({
  label,
  variableCount,
  outputName,
  className = ""
}: VariableAggregatorInfoProps) => {
  const { t } = useTranslation();

  return (
    <div className={`px-3 pb-3 ${className}`}>
      <div className="rounded-lg bg-muted/20 px-3 py-2 space-y-1.5">
        <div className="text-sm font-semibold text-foreground">
          {label?.trim() || t('workflow.nodes.variable-aggregator.name') || 'Variable Aggregator'}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="font-medium text-foreground">{variableCount}</span>
            <span>{t('workflow.nodes.variable-aggregator.merged')}</span>
          </span>
          <span className="text-muted-foreground/20">·</span>
          <span className="flex items-center gap-1">
            <span>{t('workflow.nodes.variable-aggregator.output')}</span>
            <span className="font-mono text-foreground">{outputName}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default VariableAggregatorHeaderInfo;