import { Maximize2, Minimize2 } from "lucide-react";
import { useCallback } from "react";

type ToggleExpandBtnProps = {
  expanded: boolean;
  onChange: (expanded: boolean) => void;
}

export const ToggleExpandBtn = ({ expanded, onChange }: ToggleExpandBtnProps) => {
  const handleToggle = useCallback(() => {
    onChange(!expanded);
  }, [expanded, onChange]);

  const Icon = expanded ? Minimize2 : Maximize2;
  return (
    <button
      type="button"
      onClick={handleToggle}
      className="flex items-center justify-center rounded-md p-1 text-sm font-medium text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
