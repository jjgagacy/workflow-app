import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FileAcceptType, FileSourceType, FormVariable, FormVariableOption, FormVariableType } from "../../../types";
import { DEFAULT_MAX_FILE_UPLOAD_COUNT } from "../../../constants";

export type VariableDraft = {
  type: FormVariableType;
  name: string;
  label: string;
  required: boolean;
  default: string;
  maxLength: string;
  options: FormVariableOption[];
  checkboxDefault: "checked" | "unchecked";
  fileAcceptTypes: FileAcceptType[];
  fileSourceType: FileSourceType;
  maxFiles: string;
};

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
export const createOption = (): FormVariableOption => ({ id: createId(), label: "", value: "" });

export const createDraft = (): VariableDraft => ({
  type: FormVariableType.textInput,
  name: "",
  label: "",
  required: false,
  default: "",
  maxLength: "",
  options: [createOption()],
  checkboxDefault: "unchecked",
  fileAcceptTypes: [FileAcceptType.document],
  fileSourceType: FileSourceType.local,
  maxFiles: DEFAULT_MAX_FILE_UPLOAD_COUNT.toString(),
});

export const useVariableDraft = (
  existingVariables: FormVariable[],
  initialVariable: FormVariable | null,
  onSave: (variable: FormVariable) => void,
  onClose: () => void
) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<VariableDraft>(createDraft());
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (initialVariable) {
      setDraft({
        type: initialVariable.type,
        name: initialVariable.name,
        label: initialVariable.label,
        required: !!initialVariable.required,
        default: typeof initialVariable.default === "string" ? initialVariable.default : "",
        maxLength: initialVariable.maxLength ? String(initialVariable.maxLength) : "",
        options: initialVariable.options?.length ? initialVariable.options : [createOption()],
        checkboxDefault: initialVariable.default === "checked" ? "checked" : "unchecked",
        fileAcceptTypes: initialVariable.fileAcceptTypes ?? [FileAcceptType.document],
        fileSourceType: initialVariable.fileSourceType ?? FileSourceType.local,
        maxFiles: initialVariable.maxFiles ? String(initialVariable.maxFiles) : "1",
      });
    } else {
      setDraft(createDraft());
    }
    setErrorMessage("");
  }, [initialVariable]);

  // 1. 纯粹的数据衍生逻辑（内聚在此，不污染 UI）
  const features = useMemo(() => {
    const { type } = draft;
    return {
      needsOptions: [FormVariableType.select, FormVariableType.multiSelect, FormVariableType.radio].includes(type),
      needsMaxLength: [FormVariableType.textInput, FormVariableType.textArea].includes(type),
      needsDefaultInput: [FormVariableType.textInput, FormVariableType.textArea, FormVariableType.number, FormVariableType.boolean, FormVariableType.json].includes(type),
      needsCheckboxDefault: type === FormVariableType.checkbox,
      needsFileSettings: [FormVariableType.file, FormVariableType.fileList].includes(type),
      needsMaxFiles: type === FormVariableType.fileList,
      defaultInputType: type === FormVariableType.number ? "number" : "text",
    };
  }, [draft.type]);

  // 2. 表单元素操纵方法
  const updateOption = (optionId: string, patch: Partial<FormVariableOption>) => {
    setDraft((cur) => ({
      ...cur,
      options: cur.options.map((item) => (item.id === optionId ? { ...item, ...patch } : item)),
    }));
  };

  const addOption = () => setDraft((cur) => ({ ...cur, options: [...cur.options, createOption()] }));

  const removeOption = (optionId: string) => {
    setDraft((cur) => ({
      ...cur,
      options: cur.options.length <= 1 ? cur.options : cur.options.filter((item) => item.id !== optionId),
    }));
  };

  const moveOption = (optionId: string, direction: "up" | "down") => {
    setDraft((cur) => {
      const idx = cur.options.findIndex((item) => item.id === optionId);
      if (idx < 0) return cur;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= cur.options.length) return cur;

      const next = [...cur.options];
      const [moved] = next.splice(idx, 1);
      next.splice(targetIdx, 0, moved);
      return { ...cur, options: next };
    });
  };


  // 3. 严谨的内部校验
  const validate = (): string => {
    const name = draft.name.trim();
    if (!name) return t("workflow.startPanel.error.variableNameRequired");
    if (!draft.label.trim()) return t("workflow.startPanel.error.displayNameRequired");

    const isDuplicated = existingVariables.some(
      (item) => item.name === name && item.id !== initialVariable?.id
    );
    if (isDuplicated) return t("workflow.startPanel.error.variableNameExists");

    if (features.needsOptions) {
      if (!draft.options.length) return t("workflow.startPanel.error.optionRequired");
      if (draft.options.some((item) => !item.label.trim() || !item.value.trim())) {
        return t("workflow.startPanel.error.optionLabelValueRequired");
      }
    }
    if (features.needsMaxLength && draft.maxLength) {
      const val = Number(draft.maxLength);
      if (!Number.isFinite(val) || val <= 0) return t("workflow.startPanel.error.maxLengthPositive");
    }
    if (features.needsMaxFiles) {
      const val = Number(draft.maxFiles);
      if (!Number.isFinite(val) || val <= 0) return t("workflow.startPanel.error.maxUploadPositive");
    }
    return "";
  };

  // 4. 组装提交
  const submit = () => {
    const err = validate();
    if (err) {
      setErrorMessage(err);
      return;
    }

    const nextVariable: FormVariable = {
      id: initialVariable ? initialVariable.id : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: draft.name.trim(),
      label: draft.label.trim(),
      type: draft.type,
      required: draft.required,
    };

    if (features.needsDefaultInput) nextVariable.default = draft.default;
    if (features.needsCheckboxDefault) nextVariable.default = draft.checkboxDefault;
    if (features.needsMaxLength && draft.maxLength) nextVariable.maxLength = Number(draft.maxLength);
    if (features.needsMaxFiles) nextVariable.maxFiles = Number(draft.maxFiles);
    if (features.needsFileSettings) {
      nextVariable.fileAcceptTypes = draft.fileAcceptTypes;
      nextVariable.fileSourceType = draft.fileSourceType;
    }
    if (features.needsOptions) {
      nextVariable.options = draft.options.map((o) => ({ id: o.id, label: o.label.trim(), value: o.value.trim() }));
    }

    onSave(nextVariable);
    setDraft(createDraft());
    setErrorMessage("");
    onClose();
  };

  return { draft, setDraft, errorMessage, features, updateOption, addOption, removeOption, moveOption, submit };
};
