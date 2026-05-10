import { cn } from "@/utils/classnames";
import { ChevronRight } from "lucide-react";

export interface PaletteItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  keywords?: string[];
  section?: string;
  children?: PaletteItem[];
  handler?: () => void | Promise<void>;
  matchAnySearchTerm?: boolean;
  placeholder?: string;
}

interface PaletteItemProps {
  item: PaletteItem;
  isSelected: boolean;
  onSelect: (item: PaletteItem) => void;
}

export const PaletteItem = ({ item, isSelected, onSelect }: PaletteItemProps) => {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div
      data-palette-item={item.id}
      key={item.id}
      onClick={() => onSelect(item)}
      className={cn(
        'flex items-center justify-between px-2 py-2 rounded-md cursor-pointer transition-colors',
        isSelected && 'bg-neutral-100 dark:bg-neutral-700'
      )}
    >
      <div className="flex items-center gap-2">
        {item.icon && <span className="text-neutral-500">{item.icon}</span>}
        <span className="text-sm text-neutral-900 dark:text-neutral-100">{item.title}</span>
      </div>
      {hasChildren && <ChevronRight className="w-4 h-4 text-neutral-400" />}
    </div>
  );
}
