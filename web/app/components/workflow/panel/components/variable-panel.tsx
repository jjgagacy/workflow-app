import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/app/components/base/button";
import { useDialog } from "@/app/components/hooks/use-dialog";
import { isValidVariableName } from "@/app/components/workflow/utils/var";
import { toast } from "@/app/ui/toast";
import { cn } from "@/utils/classnames";
import { VariableDialog } from "./variable-dialog";

type VariableTypeOption<TType extends string> = {
  value: TType;
  label: string;
};

type VariableRecord<TType extends string> = {
  id: string;
  type: TType;
  name: string;
  value: string;
  description: string;
};

type VariablePanelProps<TType extends string, TVariable extends VariableRecord<TType>> = {
  title: string;
  emptyText: string;
  addButtonText: string;
  dialogTitle: {
    create: string;
    edit: string;
  };
  dialogDescription: string;
  typeOptions: Array<VariableTypeOption<TType>>;
  variables: TVariable[];
  onSave: (mode: VariableDialogMode, variable: Omit<TVariable, "id">, id?: string) => void | Promise<void>;
  onDelete: (mode: "delete", variable: Omit<TVariable, "id">, id?: string) => void | Promise<void>;
  maskSecret?: boolean;
  validateValue?: (type: TType, value: string) => string;
};

type VariableDialogMode = "create" | "edit";

type VariableFormState<TType extends string> = {
  type: TType;
  name: string;
  value: string;
  description: string;
};

const maskSecretValue = (value: string) => {
  if (!value) {
    return "";
  }

  return "*".repeat(Math.max(value.length, 8));
};

export const VariablePanel = <TType extends string, TVariable extends VariableRecord<TType>>({
  title,
  emptyText,
  addButtonText,
  dialogTitle,
  dialogDescription,
  typeOptions,
  variables,
  onSave,
  onDelete,
  maskSecret = false,
  validateValue,
}: VariablePanelProps<TType, TVariable>) => {
  const { t } = useTranslation();
  const { showConfirm } = useDialog();
  const [dialogMode, setDialogMode] = useState<VariableDialogMode>("create");
  const [editingVariableId, setEditingVariableId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, setFormState] = useState<VariableFormState<TType>>({
    type: typeOptions[0].value,
    name: "",
    value: "",
    description: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const createEmptyFormState = (): VariableFormState<TType> => ({
    type: typeOptions[0].value,
    name: "",
    value: "",
    description: "",
  });

  const resetDialogState = () => {
    setDialogMode("create");
    setEditingVariableId(null);
    setFormState(createEmptyFormState());
    setErrorMessage("");
    setIsDialogOpen(false);
  };

  const openCreateDialog = () => {
    setDialogMode("create");
    setEditingVariableId(null);
    setFormState(createEmptyFormState());
    setErrorMessage("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (variable: TVariable) => {
    setDialogMode("edit");
    setEditingVariableId(variable.id);
    setFormState({
      type: variable.type,
      name: variable.name,
      value: variable.value,
      description: variable.description,
    });
    setErrorMessage("");
    setIsDialogOpen(true);
  };

  const updateFormField = <K extends keyof VariableFormState<TType>>(key: K, value: VariableFormState<TType>[K]) => {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const validateForm = () => {
    const trimmedName = formState.name.trim();

    if (!trimmedName) {
      return t("workflow.variablePanel.validation.nameRequired");
    }
    if (!isValidVariableName(trimmedName)) {
      return t("workflow.variablePanel.validation.namePattern");
    }
    const hasDuplicateName = variables.some((item) => {
      if (dialogMode === "edit" && item.id === editingVariableId) {
        return false;
      }
      return item.name === trimmedName;
    });

    if (hasDuplicateName) {
      return t("workflow.variablePanel.validation.nameExists");
    }
    if (validateValue) {
      return validateValue(formState.type, formState.value);
    }

    return "";
  };

  const handleSubmit = async () => {
    const nextError = validateForm();
    if (nextError) {
      setErrorMessage(nextError);
      toast.error(nextError);
      return;
    }

    const payload = {
      type: formState.type,
      name: formState.name.trim(),
      value: formState.value,
      description: formState.description.trim(),
    } as Omit<TVariable, "id">;

    try {
      if (dialogMode === "edit" && editingVariableId) {
        await onSave("edit", payload, editingVariableId);
      } else {
        await onSave("create", payload);
      }

      resetDialogState();
    } catch (error) {
      const message = error instanceof Error ? error.message : t("workflow.variablePanel.validation.nameExists");
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleDelete = async (variable: TVariable) => {
    const confirmed = await showConfirm(
      t("workflow.variablePanel.deleteConfirm.title", { name: variable.name || t("workflow.variablePanel.deleteConfirm.defaultName") }),
      t("workflow.variablePanel.deleteConfirm.message")
    );

    if (!confirmed) {
      return;
    }

    const payload = {
      type: variable.type,
      name: variable.name,
      value: variable.value,
      description: variable.description,
    } as Omit<TVariable, "id">;

    try {
      await onDelete("delete", payload, variable.id);

      if (editingVariableId === variable.id) {
        resetDialogState();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t("workflow.variablePanel.deleteConfirm.message");
      toast.error(message);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-muted/30 px-4 py-3">
          <div>
            <div className="mt-1 text-xs text-muted-foreground">
              {variables.length
                ? t("workflow.variablePanel.count", { count: variables.length })
                : emptyText}
            </div>
          </div>
          <Button variant="secondary" size="small" className="gap-2" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            {addButtonText}
          </Button>
        </div>

        {variables.length ? (
          <div className="flex flex-col gap-3">
            {variables.map((variable) => (
              <div key={variable.id} className="rounded-lg border border-[var(--border)] bg-background px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-semibold text-foreground">{variable.name}</div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                        {variable.type}
                      </span>
                    </div>
                    <div className="mt-2 break-all font-mono text-sm text-foreground">
                      {maskSecret && variable.type === ("secret" as TType) ? maskSecretValue(variable.value) : variable.value || "-"}
                    </div>
                    <div className={cn("mt-2 text-xs text-muted-foreground", !variable.description && "italic")}>
                      {variable.description || t("workflow.variablePanel.noDescription")}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={t("workflow.variablePanel.editAria", { name: variable.name })}
                      onClick={() => openEditDialog(variable)}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-[var(--border)] hover:bg-muted/70 hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={t("workflow.variablePanel.deleteAria", { name: variable.name })}
                      onClick={() => handleDelete(variable)}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-[var(--border)] hover:bg-muted/70 hover:text-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
            {t("workflow.variablePanel.emptyState")}
          </div>
        )}
      </div>

      <VariableDialog
        isOpen={isDialogOpen}
        dialogMode={dialogMode}
        formState={formState}
        errorMessage={errorMessage}
        typeOptions={typeOptions}
        dialogTitle={dialogTitle}
        dialogDescription={dialogDescription}
        onCancel={resetDialogState}
        onSubmit={handleSubmit}
        updateFormField={updateFormField}
      />
    </>
  );
};