import { Dialog, DialogActions, DialogButtonCancel, DialogButtonConfirm } from "@/app/ui/dialog";
import { Input } from "@/app/ui/input";
import { Select } from "@/app/ui/select";
import { Textarea } from "@/app/ui/textarea";
import { toast } from "@/app/ui/toast";
import { isValidVariableName } from "@/app/components/workflow/utils/var";
import { useTranslation } from "react-i18next";

type VariableTypeOption<TType extends string> = {
  value: TType;
  label: string;
};

type VariableFormState<TType extends string> = {
  type: TType;
  name: string;
  value: string;
  description: string;
};

type VariableDialogProps<TType extends string> = {
  isOpen: boolean;
  dialogMode: "create" | "edit";
  formState: VariableFormState<TType>;
  errorMessage: string;
  typeOptions: Array<VariableTypeOption<TType>>;
  dialogTitle: {
    create: string;
    edit: string;
  };
  dialogDescription: string;
  onCancel: () => void;
  onSubmit: () => void;
  updateFormField: <K extends keyof VariableFormState<TType>>(key: K, value: VariableFormState<TType>[K]) => void;
};

export const VariableDialog = <TType extends string>({
  isOpen,
  dialogMode,
  formState,
  errorMessage,
  typeOptions,
  dialogTitle,
  dialogDescription,
  onCancel,
  onSubmit,
  updateFormField,
}: VariableDialogProps<TType>) => {
  const { t } = useTranslation();

  const handleNameChange = (nextValue: string) => {
    if (!nextValue) {
      updateFormField("name", "");
      return;
    }

    if (!isValidVariableName(nextValue)) {
      toast.error(t("workflow.variablePanel.validation.namePattern"));
      return;
    }

    updateFormField("name", nextValue);
  };

  return (
    <Dialog
      isOpen={isOpen}
      title={dialogMode === "edit" ? dialogTitle.edit : dialogTitle.create}
      description={dialogDescription}
      className="max-w-2xl! max-h-[90dvh]!"
      onCancel={onCancel}
      actions={false}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">{t("workflow.variablePanel.type")}</label>
          <Select
            value={formState.type}
            onChange={(event) => updateFormField("type", event.target.value as TType)}
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">{t("workflow.variablePanel.name")}</label>
          <Input
            value={formState.name}
            onChange={(event) => handleNameChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && formState.name && !isValidVariableName(formState.name)) {
                event.preventDefault();
                toast.error(t("workflow.variablePanel.validation.namePattern"));
              }
            }}
            onPaste={(event) => {
              const pastedValue = event.clipboardData.getData("text");
              if (pastedValue && !isValidVariableName(pastedValue)) {
                event.preventDefault();
                toast.error(t("workflow.variablePanel.validation.namePattern"));
              }
            }}
            placeholder={t("workflow.variablePanel.namePlaceholder")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">{t("workflow.variablePanel.value")}</label>
          <Input
            value={formState.value}
            onChange={(event) => updateFormField("value", event.target.value)}
            placeholder={t("workflow.variablePanel.valuePlaceholder")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">{t("workflow.variablePanel.description")}</label>
          <Textarea
            value={formState.description}
            onChange={(event) => updateFormField("description", event.target.value)}
            placeholder={t("workflow.variablePanel.descriptionPlaceholder")}
            rows={3}
          />
        </div>

        {errorMessage ? <div className="text-sm text-red-500">{errorMessage}</div> : null}
      </div>

      <DialogActions className="px-0 pb-0 pt-6">
        <DialogButtonCancel onCancel={onCancel} cancelText={t("workflow.variablePanel.cancel")} />
        <DialogButtonConfirm
          onConfirm={onSubmit}
          isLoading={false}
          confirmText={dialogMode === "edit" ? t("workflow.variablePanel.save") : t("workflow.variablePanel.add")}
        />
      </DialogActions>
    </Dialog>
  );
};
