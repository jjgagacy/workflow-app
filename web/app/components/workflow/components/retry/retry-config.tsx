// retry-config.tsx
import React from "react";
import { Checkbox } from "@/app/ui/checkbox";

type RetryConfigProps = {
  retryOnFailure: boolean;
  retryCount: number;
  onRetryConfigChange: (patch: { retryOnFailure?: boolean; retryCount?: number }) => void;
};

const inputClassName = 'w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60';

export const RetryConfig = ({
  retryOnFailure,
  retryCount,
  onRetryConfigChange,
}: RetryConfigProps) => {
  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">失败重试</div>

      <label className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-background px-3 py-3">
        <Checkbox
          checked={retryOnFailure}
          onChange={(event) => onRetryConfigChange({ retryOnFailure: event.target.checked })}
          className="mt-0.5"
        />
        <span className="min-w-0">
          <span className="block text-sm font-medium text-foreground">失败后重试</span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            开启后，当代码执行失败时会自动重试。
          </span>
        </span>
      </label>

      {retryOnFailure && (
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">最大重试次数</div>
          <input
            type="number"
            min={1}
            step={1}
            value={retryCount}
            onChange={(event) => {
              const numericValue = Number.parseInt(event.target.value, 10);
              onRetryConfigChange({
                retryCount: Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 1,
              });
            }}
            className={inputClassName}
          />
        </label>
      )}
    </section>
  );
};