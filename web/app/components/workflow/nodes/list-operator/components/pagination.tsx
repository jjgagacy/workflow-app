import { useTranslation } from "react-i18next";
import { NodeInput } from "../../../components/base/node-input";

interface PaginationSettingsProps {
  firstN: number;
  lastN: number;
  onFirstNChange: (value: number) => void;
  onLastNChange: (value: number) => void;
}

export const PaginationSettings = ({
  firstN,
  lastN,
  onFirstNChange,
  onLastNChange,
}: PaginationSettingsProps) => {
  const { t } = useTranslation();

  return (
    <section className="grid gap-3 rounded-xl bg-muted/15 px-4 py-4 md:grid-cols-2">
      <label className="block">
        <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {t('workflow.nodes.list-operator.firstN')}
        </div>
        <NodeInput
          type="number"
          min={0}
          step={1}
          value={firstN}
          onChange={(event) => {
            const value = Number.parseInt(event.target.value, 10);
            onFirstNChange(Number.isFinite(value) && value >= 0 ? value : 0);
          }}
        />
      </label>

      <label className="block">
        <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {t('workflow.nodes.list-operator.lastN')}
        </div>
        <NodeInput
          type="number"
          min={0}
          step={1}
          value={lastN}
          onChange={(event) => {
            const value = Number.parseInt(event.target.value, 10);
            onLastNChange(Number.isFinite(value) && value >= 0 ? value : 0);
          }}
        />
      </label>
    </section>
  );
};

export default PaginationSettings;