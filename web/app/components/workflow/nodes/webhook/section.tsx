import React from "react";
import { CirclePlus, Trash2 } from "lucide-react";
import { Checkbox } from "@/app/ui/checkbox";
import { NodeInput } from "../../components/base/node-input";
import { normalizeWebhookFieldItems } from "./data";

type WebhookFieldSectionProps = {
  title: string;
  addLabel: string;
  deleteLabel: string;
  nameLabel: string;
  requiredLabel: string;
  namePlaceholder: string;
  items: ReturnType<typeof normalizeWebhookFieldItems>;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, patch: { name?: string; required?: boolean }) => void;
};

export const WebhookFieldSection = ({
  title,
  addLabel,
  deleteLabel,
  nameLabel,
  requiredLabel,
  namePlaceholder,
  items,
  onAdd,
  onRemove,
  onChange,
}: WebhookFieldSectionProps) => {
  return (
    <section className="space-y-2 rounded-xl bg-muted/10 px-3 py-2.5">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          {title}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
        >
          <CirclePlus className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      </div>

      <div className="space-y-1.5">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="pt-2.5 first:pt-0 flex items-end gap-3"
          >
            <div className="flex-1 grid grid-cols-12 gap-2">
              <label className="col-span-8 block">
                <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide ">
                  {nameLabel} {items.length > 1 && `#${index + 1}`}
                </div>
                <NodeInput
                  value={item.name}
                  onChange={(event) => onChange(item.id, { name: event.target.value })}
                  placeholder={namePlaceholder}
                  className="h-8 text-sm"
                />
              </label>

              <label className="col-span-4 flex h-8 items-center gap-1.5 self-end pb-1.5 pl-1 cursor-pointer select-none">
                <Checkbox
                  checked={item.required}
                  onChange={(event) => onChange(item.id, { required: event.target.checked })}
                />
                <span className="text-xs">{requiredLabel}</span>
              </label>
            </div>

            <div className="pb-1">
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label={deleteLabel}
                className="rounded-md p-1.5 hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};