import { useMemo } from "react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { SimpleSelect } from "@/app/ui/select";
import { buildVariableSelectItems, buildWorkflowVariableOptions } from "../../components/nodes-shared/variable-select";
import { useWorkflowStore } from "../../context";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import type { Node } from "../../types";
import { DOCUMENT_EXTRACTOR_SUPPORTED_FORMATS } from "./data";
import type { DocumentExtractorNodeData } from "./types";

type DocumentExtractorPanelProps = {
  node: Node<DocumentExtractorNodeData>;
};

const inputClassName = 'w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60';

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
  const outputVariableName = node.data.outputVariableName ?? 'documentText';

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
    <div className="space-y-4">
      <div className="rounded-lg bg-muted/20 px-4 py-3">
        <div className="text-sm font-semibold text-foreground">{node.data.label?.trim() || 'Document Extractor'}</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          从文件变量中提取文本内容，供后续节点继续处理。
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-background px-2.5 py-1">输入 {inputVariable || '未选择'}</span>
          <span className="rounded-full bg-background px-2.5 py-1">输出 {outputVariableName}</span>
        </div>
      </div>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">输入变量</div>
        <SimpleSelect
          items={fileVariableItems}
          defaultValue={inputVariable}
          allowSearch={false}
          className="w-full"
          onSelect={(item) => syncNodeData({ inputVariable: String(item.value) })}
        />
        <div className="text-xs leading-5 text-muted-foreground">
          仅可选择文件或文件数组类型变量（file / file[]）。
        </div>
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">输出变量名</div>
          <input
            value={outputVariableName}
            onChange={(event) => syncNodeData({ outputVariableName: event.target.value })}
            placeholder="例如: documentText"
            className={inputClassName}
          />
        </label>
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">支持格式</div>
        <div className="rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-xs leading-5 text-muted-foreground">
          {DOCUMENT_EXTRACTOR_SUPPORTED_FORMATS.join(' / ')}
        </div>
      </section>
    </div>
  );
};

export default DocumentExtractorPanel;
