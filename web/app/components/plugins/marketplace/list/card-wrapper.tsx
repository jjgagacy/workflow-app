import Card from "../../card";
import { Plugin } from "../../types"
import { useMixedTranslation } from "../hooks";

type CardWrapperProps = {
  plugin: Plugin;
  locale?: string;
}

const CardWrapper = ({
  plugin,
  locale,
}: CardWrapperProps) => {
  const { t } = useMixedTranslation(locale);

  return (
    <div
      className="bg-background rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow duration-200"
    >
      <Card
        key={plugin.provider}
        plugin={plugin}
        locale={locale}
      />
    </div>
  );
}

export default CardWrapper;