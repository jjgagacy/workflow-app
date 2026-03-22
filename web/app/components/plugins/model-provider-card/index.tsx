import { ModelProviderInfo } from "@/api/graphql/model-provider/types/model-provider";
import { useTranslation } from "react-i18next";

type ModelProviderCardProps = {
  provider: ModelProviderInfo;
}

const ModelProviderCard = ({ provider }: ModelProviderCardProps) => {
  const { t } = useTranslation();

  return (
    <>
    </>
  )
};

export default ModelProviderCard;

