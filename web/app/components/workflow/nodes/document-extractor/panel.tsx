import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { NodeInput } from "../../components/base/node-input";
import { VarPicker } from "../../components/variable/var-picker";
import { useWorkflowStore } from "../../context";
import { useNodeConfig } from "../../hooks/use-node-config";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import type { Node, Variable, VariableSelector } from "../../types";
import { DEFAULT_OUTPUT_VARIABLE_NAME, DOCUMENT_EXTRACTOR_SUPPORTED_FORMATS } from "./data";
import type { DocumentExtractorNodeData } from "./types";

type DocumentExtractorPanelProps = {
  node: Node<DocumentExtractorNodeData>;
};

const DocumentExtractorPanel = ({ node }: DocumentExtractorPanelProps) => {
  const { t } = useTranslation();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const { availableNodes, nodeVariableList } = useNodeConfig(node.id);
  const { onNodeDataUpdate } = useNodesUpdate();

  const inputVariable = node.data.inputVariable;
  const outputVariableName = node.data.outputVariableName ?? DEFAULT_OUTPUT_VARIABLE_NAME;

  const syncNodeData = (patch: Partial<DocumentExtractorNodeData>) => {
    const nextNode = {
      ...node,
      data: {
        ...node.data,
        ...patch,
      },
    };

    updateActivePanelNode(nextNode);
    onNodeDataUpdate({
      id: node.id,
      data: patch,
    });
  };

  const fileVariableList = useMemo(() => {
    return (nodeVariableList ?? [])
      .map((group) => ({
        ...group,
        variables: group.variables.filter((variable) => {
          const dataType = variable.dataType?.toLowerCase?.() ?? '';
          return dataType === 'file' || dataType === 'array';
        }),
      }))
      .filter((group) => group.variables.length > 0);
  }, [nodeVariableList]);

  const handleInputVariableChange = (_variable: Variable, selector: VariableSelector) => {
    syncNodeData({ inputVariable: selector });
  };

  return (
    <div className="space-y-0">
      {/* 信息头 */}
      <div className="rounded-lg bg-muted/20 px-4 py-4">
        <div className="text-sm font-semibold text-foreground">
          {node.data.label?.trim() || t('workflow.nodes.document-extractor.name')}
        </div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          {t('workflow.nodes.document-extractor.description')}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DOCUMENT_EXTRACTOR_SUPPORTED_FORMATS.map((format) => (
            <span key={format} className="rounded-full bg-background px-0 py-0.5 text-[10px] font-medium text-muted-foreground">
              {format}
            </span>
          ))}
        </div>
      </div>

      {/* 输入变量 */}
      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-1">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {t('workflow.nodes.document-extractor.input-variable')}
        </div>

        <VarPicker
          nodeId={node.id}
          value={inputVariable}
          onChange={handleInputVariableChange}
          availableNodes={availableNodes}
          nodeOutputVariables={fileVariableList}
          className="w-full"
        />

        <div className="text-xs leading-5 text-muted-foreground">
          {t('workflow.nodes.document-extractor.input-variable-description')}
        </div>
      </section>

      {/* 输出变量名 */}
      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <label className="block">
          <div className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {t('workflow.nodes.document-extractor.output-variable')}
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-background p-2.5">
            <div className="mb-2 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center rounded bg-primary/10 px-2 py-1 font-medium text-primary">
                {outputVariableName}
              </span>
              <span className="text-muted-foreground/70">=</span>
              <span className="rounded bg-muted/50 px-2 py-1 font-medium text-foreground">string</span>
            </div>
          </div>
        </label>
      </section>
    </div>
  );
};

export default DocumentExtractorPanel;
