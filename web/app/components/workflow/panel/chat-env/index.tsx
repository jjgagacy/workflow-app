import { useTranslation } from "react-i18next";
import { useWorkflowStore } from "../../context";
import { WorkflowChatEnvType } from "../../store/states/chat-env";
import { VariablePanel } from "../components/variable-panel";

export const ChatEnvPanel = () => {
  const { t } = useTranslation();
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const addChatEnvVariable = useWorkflowStore((state) => state.addChatEnvVariable);
  const updateChatEnvVariable = useWorkflowStore((state) => state.updateChatEnvVariable);
  const removeChatEnvVariable = useWorkflowStore((state) => state.removeChatEnvVariable);

  const handleDeleteChatEnvVariable = async (_mode: "delete", _variable: Omit<typeof chatEnvVariables[number], "id">, id?: string) => {
    if (id) {
      removeChatEnvVariable(id);
    }
  };

  const CHAT_ENV_TYPE_OPTIONS: Array<{ value: WorkflowChatEnvType; label: string }> = [
    { value: "string", label: t("workflow.variablePanel.types.string") },
    { value: "number", label: t("workflow.variablePanel.types.number") },
    { value: "boolean", label: t("workflow.variablePanel.types.boolean") },
    { value: "object", label: t("workflow.variablePanel.types.object") },
    { value: "any", label: t("workflow.variablePanel.types.any") },
  ];

  const validateChatEnvValue = (type: WorkflowChatEnvType, value: string) => {
    const trimmedValue = value.trim();

    if (type === "number" && trimmedValue !== "" && Number.isNaN(Number(trimmedValue))) {
      return t("workflow.variablePanel.validation.number");
    }

    if (type === "boolean" && trimmedValue !== "" && trimmedValue !== "true" && trimmedValue !== "false") {
      return t("workflow.variablePanel.validation.boolean");
    }

    if (type === "object" && trimmedValue !== "") {
      try {
        const parsed = JSON.parse(trimmedValue);

        if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
          return t("workflow.variablePanel.validation.object");
        }
      } catch {
        return t("workflow.variablePanel.validation.object");
      }
    }

    return "";
  };

  const handleSaveChatEnvVariable = (mode: "create" | "edit", variable: Omit<typeof chatEnvVariables[number], "id">, id?: string) => {
    if (mode === "edit" && id) {
      updateChatEnvVariable(id, variable);
      return;
    }

    addChatEnvVariable(variable);
  };

  return (
    <VariablePanel
      title={t("workflow.variablePanel.session.title")}
      emptyText={t("workflow.variablePanel.session.empty")}
      addButtonText={t("workflow.variablePanel.session.add")}
      dialogTitle={{
        create: t("workflow.variablePanel.session.createDialogTitle"),
        edit: t("workflow.variablePanel.session.editDialogTitle"),
      }}
      dialogDescription={t("workflow.variablePanel.session.dialogDescription")}
      typeOptions={CHAT_ENV_TYPE_OPTIONS}
      variables={chatEnvVariables}
      onSave={handleSaveChatEnvVariable}
      onDelete={handleDeleteChatEnvVariable}
      validateValue={validateChatEnvValue}
    />
  );
};

export default ChatEnvPanel;