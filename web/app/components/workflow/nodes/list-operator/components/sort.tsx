import { useTranslation } from "react-i18next";
import { Checkbox } from "@/app/ui/checkbox";
import { SimpleSelect } from "@/app/ui/select";
import { SelectItem } from "../types";

interface SortSettingsProps {
  enableSort: boolean;
  sortOrder: 'asc' | 'desc';
  sortOrderItems: SelectItem[];
  onToggleSort: (enabled: boolean) => void;
  onSortOrderChange: (order: 'asc' | 'desc') => void;
}

export const SortSettings = ({
  enableSort,
  sortOrder,
  sortOrderItems,
  onToggleSort,
  onSortOrderChange,
}: SortSettingsProps) => {
  const { t } = useTranslation();

  return (
    <section className="space-y-2 rounded-xl bg-muted/15 px-4 py-3">
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {t('workflow.nodes.list-operator.sortOrder')}
        </span>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <Checkbox
            checked={enableSort}
            onChange={(event) => onToggleSort(event.target.checked)}
            className="h-3.5 w-3.5"
          />
          <span className="text-xs text-muted-foreground">
            {t('workflow.nodes.list-operator.enableSort')}
          </span>
        </label>
        {enableSort && (
          <>
            <span className="text-muted-foreground/30">|</span>
            <SimpleSelect
              items={sortOrderItems}
              defaultValue={sortOrder}
              allowSearch={false}
              className="w-[130px]"
              onSelect={(item) => onSortOrderChange(item.value as 'asc' | 'desc')}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default SortSettings;