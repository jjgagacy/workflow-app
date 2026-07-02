import { useMemo } from "react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { SimpleSelect } from "@/app/ui/select";
import { NodeInput } from "../../components/base/node-input";
import { buildVariableSelectItems, buildWorkflowVariableOptions } from "../../components/nodes-shared/variable-select";
import { useWorkflowStore } from "../../context";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import type { Node } from "../../types";
import { DEFAULT_OUTPUT_VARIABLE_NAME, DOCUMENT_EXTRACTOR_SUPPORTED_FORMATS } from "./data";
import type { DocumentExtractorNodeData } from "./types";

type DocumentExtractorPanelProps = {
  node: Node<DocumentExtractorNodeData>;
};

const isFileType = (typeLabel?: string) => {
  const normalized = String(typeLabel ?? '').trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return (
    normalized === 'file'
    || normalized === 'file[]'
    || normalized === 'files'
    || normalized === 'array<file>'
    || normalized === 'file array'
    || normalized === 'array[file]'
  );
};

const DocumentExtractorPanel = ({ node }: DocumentExtractorPanelProps) => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const envVariables = useWorkflowStore((state) => state.envVariables);
  const { onNodeDataUpdate } = useNodesUpdate();

  const inputVariable = node.data.inputVariable ?? '';
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

  const fileVariableItems = useMemo(() => {
    const nodes = store.getState().nodes as Node[];
    const variableOptions = buildWorkflowVariableOptions({
      t,
      nodeId: node.id,
      nodes,
      envVariables,
      chatEnvVariables,
    });

    const filteredOptions = variableOptions.filter((option) => isFileType(option.description));

    return buildVariableSelectItems({
      t,
      currentValue: inputVariable,
      options: filteredOptions,
    });
  }, [chatEnvVariables, envVariables, inputVariable, node.id, store, t]);

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

        <SimpleSelect
          items={fileVariableItems}
          defaultValue={inputVariable}
          allowSearch={false}
          className="w-full"
          onSelect={(item) => syncNodeData({ inputVariable: String(item.value) })}
        />

        <div className="text-xs leading-5 text-muted-foreground">
          {t('workflow.nodes.document-extractor.input-variable-description')}
        </div>
      </section>

      {/* 输出变量名 */}
      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {t('workflow.nodes.document-extractor.output-variable')}
          </div>
          <NodeInput
            value={outputVariableName}
            onChange={(event) => syncNodeData({ outputVariableName: event.target.value })}
            placeholder={DEFAULT_OUTPUT_VARIABLE_NAME}
          />
        </label>
      </section>
    </div>
  );
};

export default DocumentExtractorPanel;
