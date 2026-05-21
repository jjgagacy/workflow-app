import Popover from "@/app/components/base/popover";
import { cn } from "@/utils/classnames";
import { CaseSensitive } from "lucide-react";
import { useFontSize } from "../../hooks/use-fontSize";

export const FontSizeSelector = () => {
  const { fontSize, fontSizeOptions, handleFontSize } = useFontSize();

  return (
    <Popover
      trigger={
        <div className="flex items-center gap-1 cursor-pointer">
          <CaseSensitive size={14} />
          <span className="text-xs text-text-secondary min-w-[24px]">{fontSize}</span>
        </div>
      }
      direction="top"
      gap={4}
      offset={0}
      padding={8}
      triggerClassName=""
      panelClassName="bg-background rounded-md shadow-md"
      sameWidth={false}
      disabled={false}
      portal={true}
    >
      {({ close }) => (
        <div className="flex flex-row gap-1 w-fit p-2">
          {fontSizeOptions.map((option) => (
            <div
              key={option.value}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded cursor-pointer text-xs font-medium transition-colors',
                'hover:bg-state-base-hover',
                fontSize === option.value
                  ? 'bg-state-accent-active text-text-accent'
                  : 'text-text-secondary',
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleFontSize(option.value);
                close();
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </Popover>
  );
};

export default FontSizeSelector;