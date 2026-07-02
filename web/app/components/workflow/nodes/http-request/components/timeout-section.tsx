import { useTranslation } from "react-i18next";
import { NodeInput } from "../../../components/base/node-input";

type TimeoutSectionProps = {
  timeoutConnectMs: number;
  timeoutReadMs: number;
  timeoutWriteMs: number;
  onTimeoutConnectChange: (value: number) => void;
  onTimeoutReadChange: (value: number) => void;
  onTimeoutWriteChange: (value: number) => void;
};

const TimeoutSection = ({
  timeoutConnectMs,
  timeoutReadMs,
  timeoutWriteMs,
  onTimeoutConnectChange,
  onTimeoutReadChange,
  onTimeoutWriteChange,
}: TimeoutSectionProps) => {
  const { t } = useTranslation();
  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.http-request.timeoutSettings')}</div>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.http-request.timeoutConnect')}</div>
          <NodeInput
            type="number"
            min={0}
            step={100}
            value={timeoutConnectMs}
            onChange={(event) => {
              const value = Number.parseInt(event.target.value, 10);
              onTimeoutConnectChange(Number.isFinite(value) && value >= 0 ? value : 0);
            }}
          />
        </label>
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.http-request.timeoutRead')}</div>
          <NodeInput
            type="number"
            min={0}
            step={100}
            value={timeoutReadMs}
            onChange={(event) => {
              const value = Number.parseInt(event.target.value, 10);
              onTimeoutReadChange(Number.isFinite(value) && value >= 0 ? value : 0);
            }}
          />
        </label>
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.http-request.timeoutWrite')}</div>
          <NodeInput
            type="number"
            min={0}
            step={100}
            value={timeoutWriteMs}
            onChange={(event) => {
              const value = Number.parseInt(event.target.value, 10);
              onTimeoutWriteChange(Number.isFinite(value) && value >= 0 ? value : 0);
            }}
          />
        </label>
      </div>
    </section>
  );
};

export default TimeoutSection;
