import { useTranslation } from "react-i18next";
import { useWorkflowStore } from "../../context";
import { WorkflowEnvType } from "../../store/states/env";
import { VariablePanel } from "../components/variable-panel";
import { getErrorMessage } from "@/utils/errors";
import { toast } from "sonner";

export const EnvPanel = () => {
  const { t } = useTranslation();
  const envVariables = useWorkflowStore((state) => state.envVariables);
  const addEnvVariable = useWorkflowStore((state) => state.addEnvVariable);
  const updateEnvVariable = useWorkflowStore((state) => state.updateEnvVariable);
  const removeEnvVariable = useWorkflowStore((state) => state.removeEnvVariable);
  const doSyncWorkflowDraft = useWorkflowStore((state) => state.doSyncWorkflowDraft);

  const handleDeleteEnvVariable = async (_mode: "delete", _variable: Omit<typeof envVariables[number], "id">, id?: string) => {
    if (id) {
      removeEnvVariable(id);
      try {
        await doSyncWorkflowDraft();
      } catch (error: any) {
        console.error("Failed to sync workflow draft:", error);
        toast.error(getErrorMessage(error) || 'sync workflow draft failed' + error.message);
      }
    }
  };

  const ENV_TYPE_OPTIONS: Array<{ value: WorkflowEnvType; label: string }> = [
    { value: "string", label: t("workflow.variablePanel.types.string") },
    { value: "number", label: t("workflow.variablePanel.types.number") },
    { value: "secret", label: t("workflow.variablePanel.types.secret") },
  ];

  const handleSaveEnvVariable = async (mode: "create" | "edit", variable: Omit<typeof envVariables[number], "id">, id?: string) => {
    if (mode === "edit" && id) {
      updateEnvVariable(id, variable);
    } else {
      addEnvVariable(variable);
    }

    try {
      await doSyncWorkflowDraft();
    } catch (error: any) {
      console.error("Failed to sync workflow draft:", error);
      toast.error(getErrorMessage(error) || 'sync workflow draft failed' + error.message);
    }
  };

  return (
    <VariablePanel
      title={t("workflow.variablePanel.environment.title")}
      emptyText={t("workflow.variablePanel.environment.empty")}
      addButtonText={t("workflow.variablePanel.environment.add")}
      dialogTitle={{
        create: t("workflow.variablePanel.environment.createDialogTitle"),
        edit: t("workflow.variablePanel.environment.editDialogTitle"),
      }}
      dialogDescription={t("workflow.variablePanel.environment.dialogDescription")}
      typeOptions={ENV_TYPE_OPTIONS}
      variables={envVariables}
      onSave={handleSaveEnvVariable}
      onDelete={handleDeleteEnvVariable}
      maskSecret
      validateValue={(type, value) => {
        if (type === "number" && value.trim() !== "" && Number.isNaN(Number(value))) {
          return t("workflow.variablePanel.validation.number");
        }

        return "";
      }}
    />
  );
};

export default EnvPanel;