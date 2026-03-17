import { cn } from "@/utils/classnames";
import { Plugin } from "../../types";
import CardWrapper from "./card-wrapper";

type ListProps = {
  plugins?: Plugin[];
  locale: string;
  containerClassName?: string;
  cardRender?: (plugin: Plugin) => React.ReactNode;
};

const List = ({
  plugins,
  locale,
  containerClassName,
  cardRender
}: ListProps) => {
  return (
    <>
      {plugins?.length && (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", containerClassName)}>
          {plugins && plugins.map((plugin, index) => {
            if (cardRender) {
              return cardRender(plugin);
            }

            return (<CardWrapper
              key={plugin.provider}
              plugin={plugin}
              locale={locale}
            />
            );
          })}
        </div>
      )}
    </>
  );
}

export default List;
