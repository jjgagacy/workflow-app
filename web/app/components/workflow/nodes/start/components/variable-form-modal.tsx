import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Dialog, DialogActions, DialogButtonCancel, DialogButtonConfirm } from "@/app/ui/dialog";
import { Input } from "@/app/ui/input";
import { SimpleSelect } from "@/app/ui/select";
import { Checkbox } from "@/app/ui/checkbox";
import { Textarea } from "@/app/ui/textarea";
import Button from "@/app/components/base/button";
import { FileAcceptType, FileSourceType, FormVariable, FormVariableType } from "../../../types";
import { useVariableDraft } from "../hooks/use-variableDraft";

type VariableFormModalProps = {
  isOpen: boolean;
  existingVariables: FormVariable[];
  initialVariable: FormVariable | null;
  onClose: () => void;
  onSave: (variable: FormVariable) => void;
  typeOptions: Array<{ value: FormVariableType; label: string }>;
};

export const VariableFormModal = ({ isOpen, existingVariables, initialVariable, onClose, onSave, typeOptions }: VariableFormModalProps) => {
  const { t } = useTranslation();
  const {
    draft,
    setDraft,
    errorMessage,
    features,
    updateOption,
    addOption,
    removeOption,
    moveOption,
    submit,
  } = useVariableDraft(existingVariables, initialVariable, onSave, onClose);

  return (
    <Dialog
      isOpen={isOpen}
      title={initialVariable ? t("workflow.startPanel.editVariable") : t("workflow.startPanel.addVariable")}
      description={t("workflow.startPanel.addVariableDescription")}
      className="max-w-2xl! max-h-[90dvh]!"
      onCancel={onClose}
      actions={false}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{t("workflow.startPanel.typeLabel")}</label>
            <SimpleSelect
              items={typeOptions.map((item) => ({ value: item.value, name: item.label }))}
              defaultValue={draft.type}
              onSelect={(item) => setDraft((c) => ({ ...c, type: item.value as FormVariableType }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{t("workflow.startPanel.variableName")}</label>
            <Input value={draft.name} onChange={(e) => setDraft((c) => ({ ...c, name: e.target.value }))} placeholder={t("workflow.startPanel.variableNamePlaceholder")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">{t("workflow.startPanel.displayName")}</label>
          <Input value={draft.label} onChange={(e) => setDraft((c) => ({ ...c, label: e.target.value }))} placeholder={t("workflow.startPanel.displayNamePlaceholder")} />
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox checked={draft.required} onChange={(e) => setDraft((c) => ({ ...c, required: e.target.checked }))} />
          {t("workflow.startPanel.requiredLabel")}
        </label>

        {features.needsDefaultInput && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{t("workflow.startPanel.defaultValue")}</label>
            {[FormVariableType.textArea, FormVariableType.json].includes(draft.type) ? (
              <Textarea value={draft.default} onChange={(e) => setDraft((c) => ({ ...c, default: e.target.value }))} placeholder={t("workflow.startPanel.textareaDefaultPlaceholder")} rows={3} />
            ) : (
              <Input type={features.defaultInputType} value={draft.default} onChange={(e) => setDraft((c) => ({ ...c, default: e.target.value }))} placeholder={t("workflow.startPanel.textDefaultPlaceholder")} />
            )}
          </div>
        )}

        {features.needsCheckboxDefault && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{t("workflow.startPanel.defaultValue")}</label>
            <SimpleSelect
              items={[
                { value: "checked", name: t("workflow.startPanel.checkboxChecked") },
                { value: "unchecked", name: t("workflow.startPanel.checkboxUnchecked") },
              ]}
              defaultValue={draft.checkboxDefault}
              onSelect={(item) => setDraft((c) => ({ ...c, checkboxDefault: item.value as "checked" | "unchecked" }))}
            />
          </div>
        )}

        {features.needsMaxLength && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{t("workflow.startPanel.maxLength")}</label>
            <Input type="number" min={1} value={draft.maxLength} onChange={(e) => setDraft((c) => ({ ...c, maxLength: e.target.value }))} placeholder={t("workflow.startPanel.maxLengthPlaceholder")} />
          </div>
        )}

        {features.needsOptions && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">{t("workflow.startPanel.options")}</label>
              <Button variant="secondary" size="small" onClick={addOption}>{t("workflow.startPanel.addOption")}</Button>
            </div>
            <div className="space-y-2">
              {draft.options.map((option, idx) => (
                <div key={option.id} className="rounded-md border border-[var(--border)] bg-muted/20 p-2">
                  <div className="flex items-center gap-2">
                    <Input value={option.label} onChange={(e) => updateOption(option.id, { label: e.target.value })} placeholder={t("workflow.startPanel.optionLabel")} />
                    <Input value={option.value} onChange={(e) => updateOption(option.id, { value: e.target.value })} placeholder={t("workflow.startPanel.optionValue")} />
                    <button type="button" onClick={() => moveOption(option.id, "up")} disabled={idx === 0} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent text-muted-foreground hover:bg-muted/70 disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" onClick={() => moveOption(option.id, "down")} disabled={idx === draft.options.length - 1} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent text-muted-foreground hover:bg-muted/70 disabled:opacity-40"><ArrowDown className="h-4 w-4" /></button>
                    <button type="button" onClick={() => removeOption(option.id)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent text-muted-foreground hover:bg-muted/70"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {features.needsFileSettings && (
          <div className="space-y-3 rounded-md border border-[var(--border)] bg-muted/20 p-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("workflow.startPanel.allowedFileTypes")}</label>
              <div className="grid grid-cols-2 gap-2">
                {[FileAcceptType.document, FileAcceptType.image, FileAcceptType.audio, FileAcceptType.video].map((fType) => (
                  <label key={fType} className="flex items-center gap-2 text-sm text-foreground">
                    <Checkbox
                      checked={draft.fileAcceptTypes.includes(fType)}
                      onChange={(e) => setDraft((c) => {
                        const set = new Set(c.fileAcceptTypes);
                        e.target.checked ? set.add(fType) : set.delete(fType);
                        return { ...c, fileAcceptTypes: Array.from(set) };
                      })}
                    />
                    {t(`workflow.startPanel.fileType${fType.charAt(0).toUpperCase() + fType.slice(1)}`)}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{t("workflow.startPanel.uploadSource")}</label>
              <SimpleSelect
                items={[
                  { value: FileSourceType.local, name: t("workflow.startPanel.uploadSourceLocal") },
                  { value: FileSourceType.url, name: t("workflow.startPanel.uploadSourceUrl") },
                  { value: FileSourceType.both, name: t("workflow.startPanel.uploadSourceBoth") },
                ]}
                defaultValue={draft.fileSourceType}
                onSelect={(item) => setDraft((c) => ({ ...c, fileSourceType: item.value as FileSourceType }))}
              />
            </div>

            {features.needsMaxFiles && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{t("workflow.startPanel.maxUploadCount")}</label>
                <Input type="number" min={1} value={draft.maxFiles} onChange={(e) => setDraft((c) => ({ ...c, maxFiles: e.target.value }))} placeholder={t("workflow.startPanel.maxUploadCountPlaceholder")} />
              </div>
            )}
          </div>
        )}

        {errorMessage && <div className="text-sm text-red-500">{errorMessage}</div>}
      </div>

      <DialogActions className="px-0 pb-0 pt-6">
        <DialogButtonCancel onCancel={onClose} cancelText={t("app.actions.cancel")} />
        <DialogButtonConfirm onConfirm={submit} isLoading={false} confirmText={t("app.actions.save")} />
      </DialogActions>
    </Dialog>
  );
};