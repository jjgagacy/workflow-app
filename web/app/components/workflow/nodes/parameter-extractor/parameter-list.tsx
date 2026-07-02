import { CirclePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SimpleSelect } from "@/app/ui/select";
import DeleteButton from "../../components/base/delete-button";
import { NodeInput } from "../../components/base/node-input";
import { NodeTextarea } from "../../components/base/node-textarea";
import { VariableDataType } from "../../types";
import type { ParameterExtractorItem } from "./types";

type SelectItem = {
  value: string;
  name: string;
  description?: string;
  group?: string;
};

const PARAMETER_TYPE_OPTIONS: SelectItem[] = [
  { value: VariableDataType.string, name: 'String' },
  { value: VariableDataType.number, name: 'Number' },
  { value: VariableDataType.boolean, name: 'Boolean' },
  { value: VariableDataType.array, name: 'Array' },
  { value: VariableDataType.object, name: 'Object' },
  { value: VariableDataType.file, name: 'File' },
  { value: VariableDataType.any, name: 'Any' },
];

interface ParameterListProps {
  parameters: ParameterExtractorItem[];
  onAddParameter: () => void;
  onRemoveParameter: (parameterId: string) => void;
  onUpsertParameter: (parameterId: string, patch: Partial<ParameterExtractorItem>) => void;
}

export const ParameterList = ({
  parameters,
  onAddParameter,
  onRemoveParameter,
  onUpsertParameter,
}: ParameterListProps) => {
  const { t } = useTranslation();

  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {t('workflow.nodes.parameter-extractor.parameters')}
        </div>
        <button
          type="button"
          onClick={onAddParameter}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-background px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/70"
        >
          <CirclePlus className="h-3.5 w-3.5" />
          {t('workflow.nodes.parameter-extractor.add_parameter')}
        </button>
      </div>

      <div className="space-y-2">
        {parameters.map((item, index) => {
          const missingDescription = !item.description?.trim();

          return (
            <div key={item.id} className="rounded-lg border border-[var(--border)] bg-background px-3 py-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {t('workflow.nodes.parameter-extractor.parameter_label', { index: index + 1 })}
                </div>
                <DeleteButton
                  onClick={() => onRemoveParameter(item.id)}
                  ariaLabel={t('workflow.nodes.parameter-extractor.remove_parameter')}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {t('workflow.nodes.parameter-extractor.parameter_name')}
                  </div>
                  <NodeInput
                    value={item.name}
                    onChange={(event) => onUpsertParameter(item.id, { name: event.target.value })}
                    placeholder={t('workflow.nodes.parameter-extractor.parameter_name_placeholder')}
                  />
                </label>

                <div className="block">
                  <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {t('workflow.nodes.parameter-extractor.parameter_type')}
                  </div>
                  <SimpleSelect
                    items={PARAMETER_TYPE_OPTIONS}
                    defaultValue={item.type}
                    allowSearch={false}
                    className="w-full"
                    onSelect={(selected) => onUpsertParameter(item.id, { type: selected.value as VariableDataType })}
                  />
                </div>
              </div>

              <label className="mt-3 block">
                <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {t('workflow.nodes.parameter-extractor.parameter_description')}
                  <span className="text-destructive">*</span>
                </div>
                <NodeTextarea
                  value={item.description}
                  onChange={(event) => onUpsertParameter(item.id, { description: event.target.value })}
                  placeholder={t('workflow.nodes.parameter-extractor.parameter_description_placeholder')}
                  rows={3}
                  className={missingDescription ? 'min-h-[88px] border-destructive' : 'min-h-[88px]'}
                />
                {missingDescription && (
                  <div className="mt-1 text-xs text-destructive">
                    {t('workflow.nodes.parameter-extractor.parameter_description_required')}
                  </div>
                )}
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ParameterList;