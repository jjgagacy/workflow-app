import { CircleAlert } from "lucide-react";
import { useMemo } from "react";
import Popover from "../../../base/popover";
import { Tooltip } from "../../../base/tooltip";
import { cn } from "@/utils/classnames";
import { useCustomTheme } from "../../../provider/customThemeProvider";
import { getThemeBgClass, getThemeHoverClass, ThemeType } from "@/types/theme";
import { ChecklistContent, type ChecklistNodeError } from "./checklist-content";
import { useReactFlow, useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { Edge, Node } from "../../types";
import { useCheckList } from "../../hooks/use-checkList";

export const Checklist = () => {
  const { t } = useTranslation();
  const { activeColorTheme } = useCustomTheme();
  const reactFlow = useReactFlow<Node, Edge>();
  const storeApi = useStoreApi<Node, Edge>();
  const { checkNodesList } = useCheckList();

  return (
    <Popover
      direction="right start"
      gap={8}
      portal
      triggerClassName="inline-flex relative"
      panelClassName="z-50"
      trigger={({ open }) => (
        <Tooltip content={t('workflow.checklist.title')} placement="left">
          <div
            className={cn(
              `relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm border border-[var(--border)] ${getThemeBgClass(activeColorTheme as ThemeType)} ${getThemeHoverClass(activeColorTheme as ThemeType)} transition-colors`,
              open && "ring-1 ring-primary/30"
            )}
          >
            <CircleAlert className="h-4 w-4" />
            {checkNodesList.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
                {checkNodesList.length}
              </span>
            )}
          </div>
        </Tooltip>
      )}
    >
      {({ close }) => <ChecklistContent close={close} items={checkNodesList} />}
    </Popover>
  );
};

export default Checklist;
