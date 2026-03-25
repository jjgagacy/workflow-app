'use client';

import { CredentialFormSchema, FormType, FormValue, ModelProviderInfo } from "@/api/graphql/model-provider/types/model-provider";
import { Dialog } from "@/app/ui/dialog";
import { useTranslation } from "react-i18next";
import Form from "./form";
import { useCallback, useMemo, useState } from "react";
import { ConfigurationMethod, CredentialFormSchemaAll } from "../types";
import { getLanguage } from "@/i18n/config";
import { getClientLocale } from "@/i18n";
import { saveCredentials, useProviderCredentials } from "../hooks";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/app/ui/toast";
import { getErrorMessage } from "@/utils/errors";

type ModelProviderSetupModalProps = {
  provider: ModelProviderInfo;
  configMethod: ConfigurationMethod;
  onCancel: () => void;
  onSave: () => void;
}

const ModelProviderSetupModal = ({ provider, configMethod, onCancel, onSave }: ModelProviderSetupModalProps) => {
  const { t } = useTranslation();
  const defaultLocale = getClientLocale();
  const locale = getLanguage(defaultLocale);
  const isProviderFormSchema = configMethod === ConfigurationMethod.predefinedModel;
  const [isLoading, setIsLoading] = useState(false);
  const { isCurrentManager } = useAuth();

  const formSchemas = useMemo(() => {
    const formSchemas = isProviderFormSchema
      ? provider.providerCredentialSchema?.credentialFormSchema
      : provider.modelCredentialSchema?.credentialFormSchema;
    return formSchemas || [];
  }, [isProviderFormSchema, provider.providerCredentialSchema, provider.modelCredentialSchema]);

  const { credentials: formCredentials, mutate } = useProviderCredentials(provider.providerName);

  const [requiredFormSchema, defaultSchemaValue] = useMemo(() => {
    const requiredFormSchema: CredentialFormSchemaAll[] = [];
    const defaultSchemaValue: FormValue = {};

    formSchemas.forEach(schema => {
      if (schema.required) {
        requiredFormSchema.push(schema);
      }
      if (schema.default) {
        defaultSchemaValue[schema.variable] = schema.default;
      }
    });

    return [requiredFormSchema, defaultSchemaValue];
  }, [formSchemas]);

  const initialFormValue = useMemo(() => {
    return {
      ...defaultSchemaValue,
      ...formCredentials
    }
  }, [defaultSchemaValue, formCredentials]);

  const [formValue, setFormValue] = useState(initialFormValue);
  const isEditMode = isCurrentManager;

  const secretFormSchemas = useMemo(() => {
    return (isProviderFormSchema
      ? provider.providerCredentialSchema?.credentialFormSchema
      : provider.modelCredentialSchema?.credentialFormSchema
    )?.filter(schema => schema.type === FormType.SECRET_INPUT);
  }, [
    provider.providerCredentialSchema,
    provider.modelCredentialSchema,
    isProviderFormSchema
  ]);

  const secretFormValues = useCallback((v: FormValue) => {
    const secretValues: FormValue = { ...v };
    secretFormSchemas?.forEach(({ variable }) => {
      if (secretValues[variable] !== undefined && secretValues[variable] === formCredentials?.[variable]) {
        secretValues[variable] = '[__HIDDEN__]';
      }
    });
    return secretValues;
  }, [secretFormSchemas, formCredentials]);

  const handleFormChange = (value: FormValue) => {
    setFormValue(value);
  };

  const handleFormSave = async () => {
    try {
      setIsLoading(true);
      await saveCredentials(
        isProviderFormSchema,
        provider.providerName,
        secretFormValues(formValue)
      );
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
      onConfirm={() => handleFormSave()}
      onCancel={onCancel}
      className="min-w-2xl"
    >
      <Form
        formSchemas={formSchemas}
        isEditing={isEditMode}
        value={formValue}
        onChange={handleFormChange}
      />
    </Dialog>
  );
};

export default ModelProviderSetupModal;