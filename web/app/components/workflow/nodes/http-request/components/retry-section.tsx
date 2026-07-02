import { Checkbox } from "@/app/ui/checkbox";
import { NodeInput } from "../../../components/base/node-input";
import { cn } from "@/utils/classnames";
import { useTranslation } from "react-i18next";

type RetrySectionProps = {
  retryOnFailure: boolean;
  retryCount: number;
  retryIntervalMs: number;
  onRetryToggle: (checked: boolean) => void;
  onRetryCountChange: (value: number) => void;
  onRetryIntervalChange: (value: number) => void;
};

const RetrySection = ({
  retryOnFailure,
  retryCount,
  retryIntervalMs,
  onRetryToggle,
  onRetryCountChange,
  onRetryIntervalChange,
}: RetrySectionProps) => {
  const { t } = useTranslation();
  return (
    <section className="rounded-xl bg-muted/15 p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">{t('workflow.nodes.http-request.retrySettings')}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {t('workflow.nodes.http-request.retrySettingsDescription')}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--border)] pt-4">
        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            checked={retryOnFailure}
            onChange={(event) => onRetryToggle(event.target.checked)}
            className="mt-0.5"
          />

          <div className="min-w-0">
            <div className="text-sm font-medium">{t('workflow.nodes.http-request.retryOnFailure')}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {t('workflow.nodes.http-request.retryOnFailureDescription')}
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
              <div className="flex flex-col gap-4">
                {/* 最大重试次数 */}
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{t('workflow.nodes.http-request.maxRetryCount')}</div>
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
                        onRetryCountChange(
                          Number.isFinite(value) && value > 0 ? value : 1
                        );
                      }}
                    />
                    <span className="text-sm text-muted-foreground">{t('workflow.nodes.http-request.retryCountUnit')}</span>
                  </div>
                </div>

                {/* 重试间隔 */}
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{t('workflow.nodes.http-request.retryInterval')}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <NodeInput
                      className="w-20 text-center"
                      type="number"
                      min={0}
                      step={100}
                      value={retryIntervalMs}
                      onChange={(event) => {
                        const value = Number.parseInt(event.target.value, 10);
                        onRetryIntervalChange(
                          Number.isFinite(value) && value >= 0 ? value : 0
                        );
                      }}
                    />
                    <span className="text-sm text-muted-foreground">{t('workflow.nodes.http-request.retryIntervalUnit')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RetrySection;