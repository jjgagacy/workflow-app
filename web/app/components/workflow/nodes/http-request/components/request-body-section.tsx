import { SimpleSelect } from "@/app/ui/select";
import { NodeTextarea } from "../../../components/base/node-textarea";
import type { HttpKeyValueItem } from "../types";
import type { HttpBodyType } from "../../../types";
import KeyValueEditor from "./key-value-editor";
import type { SelectItem } from "./types";
import { useTranslation } from "react-i18next";

type RequestBodySectionProps = {
  bodyType: HttpBodyType;
  bodyTypeItems: SelectItem[];
  bodyFormData: HttpKeyValueItem[];
  bodyUrlEncoded: HttpKeyValueItem[];
  bodyJson: string;
  bodyRaw: string;
  bodyBinaryVariable: string;
  variableItems: SelectItem[];
  onBodyTypeChange: (value: HttpBodyType) => void;
  onBodyJsonChange: (value: string) => void;
  onBodyRawChange: (value: string) => void;
  onBodyBinaryVariableChange: (value: string) => void;
  onAddFormData: () => void;
  onRemoveFormData: (id: string) => void;
  onChangeFormData: (id: string, patch: Partial<HttpKeyValueItem>) => void;
  onAddUrlEncoded: () => void;
  onRemoveUrlEncoded: (id: string) => void;
  onChangeUrlEncoded: (id: string, patch: Partial<HttpKeyValueItem>) => void;
};

const RequestBodySection = ({
  bodyType,
  bodyTypeItems,
  bodyFormData,
  bodyUrlEncoded,
  bodyJson,
  bodyRaw,
  bodyBinaryVariable,
  variableItems,
  onBodyTypeChange,
  onBodyJsonChange,
  onBodyRawChange,
  onBodyBinaryVariableChange,
  onAddFormData,
  onRemoveFormData,
  onChangeFormData,
  onAddUrlEncoded,
  onRemoveUrlEncoded,
  onChangeUrlEncoded,
}: RequestBodySectionProps) => {
  const { t } = useTranslation();
  const showBodyValueInput = bodyType !== "none" && bodyType !== "binary";

  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.http-request.requestBody')}</div>
      <div className="max-w-[320px]">
        <SimpleSelect
          items={bodyTypeItems}
          defaultValue={bodyType}
          allowSearch={false}
          className="w-full"
          onSelect={(item) => onBodyTypeChange(item.value as HttpBodyType)}
        />
      </div>

      {bodyType === "form-data" && (
        <KeyValueEditor
          title={t('workflow.nodes.http-request.formData')}
          addLabel={t('workflow.nodes.http-request.addField')}
          items={bodyFormData}
          onAdd={onAddFormData}
          onRemove={onRemoveFormData}
          onChange={onChangeFormData}
        />
      )}

      {bodyType === "x-www-form-urlencoded" && (
        <KeyValueEditor
          title={t('workflow.nodes.http-request.urlEncoded')}
          addLabel={t('workflow.nodes.http-request.addField')}
          items={bodyUrlEncoded}
          onAdd={onAddUrlEncoded}
          onRemove={onRemoveUrlEncoded}
          onChange={onChangeUrlEncoded}
        />
      )}

      {showBodyValueInput && (bodyType === "json" || bodyType === "raw") && (
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.http-request.bodyContent')}</div>
          <NodeTextarea
            value={bodyType === "json" ? bodyJson : bodyRaw}
            onChange={(event) => {
              if (bodyType === "json") {
                onBodyJsonChange(event.target.value);
              } else {
                onBodyRawChange(event.target.value);
              }
            }}
            placeholder={bodyType === "json" ? '{\n  "key": "value"\n}' : "Raw body text"}
            rows={5}
            className="min-h-[120px]"
          />
        </label>
      )}

      {bodyType === "binary" && (
        <div className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.http-request.binaryVariable')}</div>
          <SimpleSelect
            items={variableItems}
            defaultValue={bodyBinaryVariable}
            allowSearch={false}
            className="w-full"
            onSelect={(item) => onBodyBinaryVariableChange(String(item.value))}
          />
        </div>
      )}
    </section>
  );
};

export default RequestBodySection;
