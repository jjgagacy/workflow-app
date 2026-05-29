import { Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/utils/classnames";

type TitleInputProps = {
  title: string;
  onChange: (value: string) => void;
};

export const TitleInput = ({ title, onChange }: TitleInputProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleActivate = () => {
    setIsEditing(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-md px-1 py-0.5 transition-shadow",
        isEditing && "shadow-sm ring-1 ring-[var(--border)]",
      )}
      onClick={handleActivate}
    >
      {!isEditing && (
        <button
          type="button"
          aria-label="Edit title"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
          onClick={(event) => {
            event.stopPropagation();
            handleActivate();
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
      <input
        ref={inputRef}
        className="min-w-0 flex-1 border-0 bg-transparent px-0 py-0 text-sm font-semibold text-foreground outline-none"
        value={title}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setIsEditing(false)}
      />
    </div>
  );
}

TitleInput.displayName = "TitleInput";