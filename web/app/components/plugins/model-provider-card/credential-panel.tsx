import { ModelProviderInfo } from "@/api/graphql/model-provider/types/model-provider";
import { useTranslation } from "react-i18next";
import Button from "../../base/button";

type CredentialPanelProps = {
  provider: ModelProviderInfo;
  onSetup?: () => void;
}

const CredentialPanel = ({ provider, onSetup }: CredentialPanelProps) => {
  const { t } = useTranslation();

  return (
    <>
      {provider.providerCredentialSchema && (
        <div className="relative ml-1 w-[100px] shrink-0 rounded-2xl border-[0.5px] border-[var(--border)] bg-gray-50 dark:bg-gray-800 p-1">
          <div className="mb-1 flex items-center justify-center pl-2 pr-[5px] pt-1 dark:text-white">
            API Key
          </div>
          <div className="flex items-center justify-center">
            <Button
              variant={'primary'}
              size={'small'}
              onClick={onSetup}
            >
              {t('app.actions.setup')}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default CredentialPanel;