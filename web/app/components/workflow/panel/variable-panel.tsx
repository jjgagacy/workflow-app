import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import Button from "@/app/components/base/button";
import { Dialog, DialogActions, DialogButtonCancel, DialogButtonConfirm } from "@/app/ui/dialog";
import { Input } from "@/app/ui/input";
import { Select } from "@/app/ui/select";
import { Textarea } from "@/app/ui/textarea";
import { cn } from "@/utils/classnames";

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
  addVariable: (variable: Omit<TVariable, "id">) => TVariable;
  updateVariable: (id: string, variable: Omit<TVariable, "id">) => void;
  removeVariable: (id: string) => void;
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
  addVariable,
  updateVariable,
  removeVariable,
  maskSecret = false,
  validateValue,
}: VariablePanelProps<TType, TVariable>) => {
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
      return "Variable name is required.";
    }

    const hasDuplicateName = variables.some((item) => {
      if (dialogMode === "edit" && item.id === editingVariableId) {
        return false;
      }

      return item.name === trimmedName;
    });

    if (hasDuplicateName) {
      return "Variable name already exists.";
    }

    if (validateValue) {
      return validateValue(formState.type, formState.value);
    }

    return "";
  };

  const handleSubmit = () => {
    const nextError = validateForm();
    if (nextError) {
      setErrorMessage(nextError);
      return;
    }

    const payload = {
      type: formState.type,
      name: formState.name.trim(),
      value: formState.value,
      description: formState.description.trim(),
    } as Omit<TVariable, "id">;

    if (dialogMode === "edit" && editingVariableId) {
      updateVariable(editingVariableId, payload);
    } else {
      addVariable(payload);
    }

    resetDialogState();
  };

  const handleDelete = (id: string) => {
    removeVariable(id);

    if (editingVariableId === id) {
      resetDialogState();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-muted/30 px-4 py-3">
          <div>
            <div className="text-sm font-medium text-foreground">{title}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {variables.length
                ? `${variables.length} variable${variables.length > 1 ? "s" : ""} configured.`
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
                      {variable.description || "No description"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Edit ${variable.name}`}
                      onClick={() => openEditDialog(variable)}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-[var(--border)] hover:bg-muted/70 hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${variable.name}`}
                      onClick={() => handleDelete(variable.id)}
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
            Add your first variable to use it in this workflow.
          </div>
        )}
      </div>

      <Dialog
        isOpen={isDialogOpen}
        title={dialogMode === "edit" ? dialogTitle.edit : dialogTitle.create}
        description={dialogDescription}
        onCancel={resetDialogState}
        actions={false}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Type</label>
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
            <label className="text-sm font-medium text-foreground">Variable name</label>
            <Input
              value={formState.name}
              onChange={(event) => updateFormField("name", event.target.value)}
              placeholder="e.g. API_BASE_URL"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Value</label>
            <Input
              value={formState.value}
              onChange={(event) => updateFormField("value", event.target.value)}
              placeholder="Enter a value"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              value={formState.description}
              onChange={(event) => updateFormField("description", event.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          {errorMessage ? <div className="text-sm text-red-500">{errorMessage}</div> : null}
        </div>

        <DialogActions className="px-0 pb-0 pt-6">
          <DialogButtonCancel onCancel={resetDialogState} cancelText="Cancel" />
          <DialogButtonConfirm
            onConfirm={handleSubmit}
            isLoading={false}
            confirmText={dialogMode === "edit" ? "Save" : "Add"}
          />
        </DialogActions>
      </Dialog>
    </>
  );
};