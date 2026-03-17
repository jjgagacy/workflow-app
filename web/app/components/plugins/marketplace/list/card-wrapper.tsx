import { useCallback } from "react";
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

  const handleInstallClick = useCallback(() => {
    console.log(`Installing plugin: ${plugin.name}`);
  }, []);

  return (
    <div
      className="bg-background rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow duration-200"
    >
      <Card
        key={`${plugin.author}/${plugin.name}`}
        plugin={plugin}
        locale={locale}
        onClick={handleInstallClick}
      />
    </div>
  );
}

export default CardWrapper;