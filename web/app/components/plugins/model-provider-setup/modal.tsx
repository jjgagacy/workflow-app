import { ModelProviderInfo } from "@/api/graphql/model-provider/types/model-provider";
import { Dialog } from "@/app/ui/dialog";
import { useTranslation } from "react-i18next";
import Form from "./form";
import { useMemo } from "react";
import { ConfigurationMethod } from "../types";

type ModelProviderSetupModalProps = {
  provider: ModelProviderInfo;
  configMethod: ConfigurationMethod;
  onCancel: () => void;
  onSave: () => void;
}

const ModelProviderSetupModal = ({ provider, configMethod, onCancel, onSave }: ModelProviderSetupModalProps) => {
  const { t } = useTranslation();
  const useProviderFormSchema = configMethod === ConfigurationMethod.predefinedModel;
  const formSchemas = useMemo(() => {
    const formSchemas = useProviderFormSchema
      ? provider.providerCredentialSchema?.credentialFormSchema
      : provider.modelCredentialSchema?.credentialFormSchema;
    return formSchemas || [];
  }, [useProviderFormSchema, provider]);

  return (
    <Dialog
      isOpen={true}
      isLoading={false}
      title={t('app.actions.setup')}
      description=""
      confirmText={t('app.actions.confirm')}
      cancelText={t('app.actions.cancel')}
      onConfirm={onSave}
      onCancel={onCancel}
      className="min-w-2xl"
    >
      <Form
        formSchemas={formSchemas}
        isEditing={true}
      />
      <p style={{ height: '30px' }}>a123</p>
      <p style={{ height: '40px' }}>b123</p>
      <p style={{ height: '50px' }}>c123</p>
      <p style={{ height: '60px' }}>d123</p>
      <p style={{ height: '120px' }}>d123</p>
      <p style={{ height: '120px' }}>e123</p>
      <p style={{ height: '120px' }}>q123</p>
    </Dialog>
  );
};

export default ModelProviderSetupModal;