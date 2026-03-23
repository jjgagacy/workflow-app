import { ModelProviderInfo } from "@/api/graphql/model-provider/types/model-provider";
import { cn } from "@/utils/classnames";
import { useTranslation } from "react-i18next";
import ProviderIcon from "../provider-icon";
import CredentialPanel from "./credential-panel";

type ModelProviderCardProps = {
  provider: ModelProviderInfo;
  onOpenModal?: () => void;
}

const ModelProviderCard = ({ provider, onOpenModal }: ModelProviderCardProps) => {
  const { t } = useTranslation();

  return (
    <div className={cn('mb-2 rounded-2xl border border-[var(--border)] shadow-xs py-3')}>
      <div className="flex px-2 pl-3 pr-2">
        <div className="grow px-1 pb-0.5 pt-1">
          <ProviderIcon provider={provider} className="mb-2" />
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          <CredentialPanel provider={provider} onSetup={onOpenModal} />
        </div>
      </div>
    </div>
  );
};

export default ModelProviderCard;

