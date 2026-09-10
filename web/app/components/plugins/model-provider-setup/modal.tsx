'use client';

import { FormType, FormValue, ModelProviderInfo } from "@/api/graphql/model-provider/types/model-provider";
import { Dialog } from "@/app/ui/dialog";
import { useTranslation } from "react-i18next";
import Form from "./form";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfigurationMethod } from "../types";
import { useProviderCredentials } from "../hooks";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/app/ui/toast";
import { getErrorMessage } from "@/utils/errors";
import api from "@/api";
import { merge } from "lodash-es";

type ModelProviderSetupModalProps = {
  provider: ModelProviderInfo;
  configMethod: ConfigurationMethod;
  onCancel: () => void;
  onSave: () => void;
};

const ModelProviderSetupModal = ({ provider, configMethod, onCancel, onSave }: ModelProviderSetupModalProps) => {
  const { t } = useTranslation();
  const { isCurrentManager } = useAuth();
  const useSaveCredential = api.modelProvider.useSaveCredential();

  const isProviderFormSchema = configMethod === ConfigurationMethod.predefinedModel;

  // 1. 获取对应的 Form Schema 列表
  const formSchemas = useMemo(() => {
    const credentialSchema = isProviderFormSchema
      ? provider.providerCredentialSchema
      : provider.modelCredentialSchema;
    return credentialSchema?.credentialFormSchema || [];
  }, [isProviderFormSchema, provider.providerCredentialSchema, provider.modelCredentialSchema]);

  // 2. 提取 Schema 默认值
  const defaultSchemaValue = useMemo(() => {
    const defaultValue: FormValue = {};
    formSchemas.forEach(schema => {
      if (schema.default) {
        defaultValue[schema.variable] = schema.default;
      }
    });
    return defaultValue;
  }, [formSchemas]);

  // 3. 获取已保存的 Credentials (异步)
  const { credentials: formCredentials, mutate } = useProviderCredentials(provider.providerName);

  // 4. 合并默认值与已拉取到的凭证
  const mergedFormValue = useMemo(
    () => ({
      ...defaultSchemaValue,
      ...formCredentials,
    }),
    [defaultSchemaValue, formCredentials],
  );

  // 5. 状态定义：表单值 + 是否已被用户编辑 (isDirty)
  const [formValue, setFormValue] = useState<FormValue>(mergedFormValue);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 当切换 Provider 时，重置 isDirty 标记
  useEffect(() => {
    setIsDirty(false);
  }, [provider.providerName]);

  // 2. 避免使用对象引用，将 credentials 序列化为稳定 key，防止死循环
  const credentialsKey = JSON.stringify(formCredentials);
  // 【核心简化】：仅在用户未修改表单 (!isDirty) 时，同步最新的数据/默认值
  useEffect(() => {
    if (!isDirty) {
      setFormValue(mergedFormValue);
    }
  }, [credentialsKey, isDirty]);

  // 用户交互时，标记表单为 dirty
  const handleFormChange = (value: FormValue) => {
    setIsDirty(true);
    setFormValue(value);
  };

  // 6. 密钥类字段脱敏逻辑 (直接复用计算好的 formSchemas)
  const secretFormSchemas = useMemo(() => {
    return formSchemas.filter(schema => schema.type === FormType.SECRET_INPUT);
  }, [formSchemas]);

  const secretFormValues = useCallback((v: FormValue) => {
    const secretValues: FormValue = { ...v };
    secretFormSchemas.forEach(({ variable }) => {
      if (secretValues[variable] !== undefined && secretValues[variable] === formCredentials?.[variable]) {
        secretValues[variable] = '[__HIDDEN__]';
      }
    });
    return secretValues;
  }, [secretFormSchemas, formCredentials]);

  const handleFormSave = async () => {
    try {
      setIsLoading(true);
      await useSaveCredential({
        input: {
          providerName: provider.providerName,
          credentials: secretFormValues(formValue),
        },
      });
      toast.success(t('system.operation_successed'));
      mutate();
      onSave();
      onCancel();
    } catch (error: any) {
      console.error('Failed to save credentials:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={true}
      isLoading={isLoading}
      title={t('app.actions.setup')}
      description=""
      confirmText={t('app.actions.confirm')}
      cancelText={t('app.actions.cancel')}
      onConfirm={handleFormSave}
      onCancel={onCancel}
      className="min-w-2xl"
    >
      <Form
        formSchemas={formSchemas}
        isEditing={isCurrentManager}
        value={formValue}
        onChange={handleFormChange}
      />
    </Dialog>
  );
};

export default ModelProviderSetupModal;