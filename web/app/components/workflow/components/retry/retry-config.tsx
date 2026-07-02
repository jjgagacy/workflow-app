import React from "react";
import { RotateCcw } from "lucide-react";
import { Checkbox } from "@/app/ui/checkbox";
import { NodeInput } from "../base/node-input";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/classnames";

type RetryConfigProps = {
  retryOnFailure: boolean;
  retryCount: number;
  onRetryConfigChange: (patch: {
    retryOnFailure?: boolean;
    retryCount?: number;
  }) => void;
};

export const RetryConfig = ({
  retryOnFailure,
  retryCount,
  onRetryConfigChange,
}: RetryConfigProps) => {
  const { t } = useTranslation();

  return (
    <section className="rounded-xl bg-muted/15 p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">
            {t("workflow.retryConfig.retryOnFailure")}
          </h3>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {t("workflow.retryConfig.retryOnFailureDesc")}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--border)] pt-4">
        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            checked={retryOnFailure}
            onChange={(event) =>
              onRetryConfigChange({
                retryOnFailure: event.target.checked,
              })
            }
            className="mt-0.5"
          />

          <div className="min-w-0">
            <div className="text-sm font-medium">
              {t("workflow.retryConfig.enable")}
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              {t("workflow.retryConfig.retryOnFailureDesc")}
            </div>
          </div>
        </label>

        <div
          className={cn(
            "grid overflow-hidden transition-all duration-300",
            retryOnFailure
              ? "mt-4 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="rounded-lg bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {t("workflow.retryConfig.maxRetryCount")}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <NodeInput
                    className="w-20 text-center"
                    type="number"
                    min={1}
                    step={1}
                    value={retryCount}
                    onChange={(event) => {
                      const value = Number.parseInt(event.target.value, 10);

                      onRetryConfigChange({
                        retryCount:
                          Number.isFinite(value) && value > 0 ? value : 1,
                      });
                    }}
                  />

                  <span className="text-sm text-muted-foreground">
                    {t("workflow.retryConfig.times")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};