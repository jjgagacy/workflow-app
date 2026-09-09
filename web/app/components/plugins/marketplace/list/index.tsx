import { cn } from "@/utils/classnames";
import { Plugin } from "../../types";
import CardWrapper from "./card-wrapper";

type ListProps = {
  plugins?: Plugin[];
  locale: string;
  containerClassName?: string;
  cardRender?: (plugin: Plugin) => React.ReactNode;
  onInstalled?: (plugin: Plugin) => void;
  onFailed?: (message: string) => void;
};

const List = ({
  plugins,
  locale,
  containerClassName,
  cardRender,
  onInstalled,
  onFailed
}: ListProps) => {
  return (
    <>
      {plugins?.length && (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", containerClassName)} test-id="marketplace-plugin-list">
          {plugins && plugins.map((plugin, index) => {
            if (cardRender) {
              return cardRender(plugin);
            }

            return (
              <CardWrapper
                key={`${plugin.author}-${plugin.name}`}
                plugin={plugin}
                locale={locale}
                onInstalled={onInstalled}
                onFailed={onFailed}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

export default List;
