import { useTranslation } from "react-i18next";
import { NodeInput } from "../../../components/base/node-input";

type OutputSectionProps = {
  outputVariableName: string;
  onOutputVariableNameChange: (value: string) => void;
};

const OutputSection = ({ outputVariableName, onOutputVariableNameChange }: OutputSectionProps) => {
  const { t } = useTranslation();
  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <label className="block">
        <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.http-request.outputVariableName')}</div>
        <NodeInput
          value={outputVariableName}
          onChange={(event) => onOutputVariableNameChange(event.target.value)}
          placeholder=""
        />
      </label>
    </section>
  );
};

export default OutputSection;
