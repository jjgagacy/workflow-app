import { CirclePlus } from "lucide-react";
import DeleteButton from "../../../components/base/delete-button";
import { NodeInput } from "../../../components/base/node-input";
import type { HttpKeyValueItem } from "../types";
import type { KeyValuePatch } from "./types";
import { useTranslation } from "react-i18next";

type KeyValueEditorProps = {
  title: string;
  addLabel: string;
  items: HttpKeyValueItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, patch: KeyValuePatch) => void;
};

const KeyValueEditor = ({
  title,
  addLabel,
  items,
  onAdd,
  onRemove,
  onChange,
}: KeyValueEditorProps) => {
  const { t } = useTranslation();
  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{title}</div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-background px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/70"
        >
          <CirclePlus className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-lg border border-[var(--border)] bg-background px-3 py-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{title} {index + 1}</div>
              <DeleteButton
                onClick={() => onRemove(item.id)}
                ariaLabel={t('workflow.nodes.http-request.deleteHeader')}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Key</div>
                <NodeInput
                  value={item.key}
                  onChange={(event) => onChange(item.id, { key: event.target.value })}
                  placeholder="e.g.: Authorization"
                />
              </label>
              <label className="block">
                <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Value</div>
                <NodeInput
                  value={item.value}
                  onChange={(event) => onChange(item.id, { value: event.target.value })}
                  placeholder="e.g.: Bearer xxx"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default KeyValueEditor;
