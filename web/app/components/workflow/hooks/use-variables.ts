import { useCallback } from "react";
import { NodeOutputVariable, ValueSourceMode, VariableDataType, type Variable, Node, VariableSelector, NodeType, VariableGroup, FormVariableType, FormVariable } from "../types";
import { appIdVariable, conversationIdVariable, dialogueCountVariable, timestampVariable, userIdVariable, workflowRunIdVariable, workflowIdVariable, HTTP_REQUEST_OUTPUT_VARIABLES, KNOWLEDGE_RETRIEVAL_OUTPUT_VARIABLES, LLM_OUTPUT_VARIABLES, TEMPLATE_TRANSFORM_OUTPUT_VARIABLES } from "../constants";
import { useTranslation } from "react-i18next";
import { WorkflowEnvVariable } from "../store/states/env";
import { WorkflowChatEnvVariable } from "../store/states/chat-env";
import { StartNodeData } from "../nodes/start/type";
import { formVariableTypeToVariableType } from "../utils/var";
import { WebhookNodeData } from "../nodes/webhook/type";
import { CodeNodeData } from "../nodes/code/types";
import { DocumentExtractorNodeData } from "../nodes/document-extractor/types";
import { DEFAULT_OUTPUT_VARIABLE_NAME } from "../nodes/document-extractor/data";
import { IfElseNodeData } from "../nodes/if-else/types";
import { normalizeParameterExtractorItems } from "../nodes/parameter-extractor/data";
import type { ParameterExtractorNodeData } from "../nodes/parameter-extractor/types";
import type { KnowledgeRetrievalNodeData } from "../nodes/knowledge-retrieval/types";
import type { ListOperatorNodeData } from "../nodes/list-operator/types";
import type { QuestionClassifierNodeData } from "../nodes/question-classifier/types";
import type { LLMNodeData } from "../nodes/llm/types";
import type { VariableAggregatorNodeData } from "../nodes/variable-aggregator/types";
import type { EndNodeType } from "../nodes/end/type";

export const useVariables = () => {
  const { t } = useTranslation();

  /// 获取内置变量
  const getSystemVariables = useCallback((isChatMode: boolean) => {
    const vars: Variable[] = [
      ...(isChatMode ?
        [dialogueCountVariable, conversationIdVariable]
        : []
      ),
      userIdVariable,
      appIdVariable,
      workflowIdVariable,
      workflowRunIdVariable,
      timestampVariable,
    ];
    return vars.map((v) => ({
      ...v,
      label: t(v.label || ''),
    }));
  }, []);

  /// 获取节点输出变量
  const getNodeOutputVariable = useCallback((
    node: { id: string; data: { type: string; label?: string;[key: string]: any; } },
    isChatMode: boolean,
    filterVariable: (variable: Variable, selector: VariableSelector) => boolean,
  ): NodeOutputVariable => {
    const { id, data } = node;
    const res: NodeOutputVariable = {
      nodeId: id,
      title: data.title ? t(data.title) : (data.label || id),
      variables: [],
    };

    const dataType = data.type as string;
    switch (dataType) {
      case NodeType.Start:
        const { formVariables } = data as StartNodeData;
        // const type = formVariableTypeToVariableType()
        res.variables = !formVariables ? [] : formVariables.map((variable: FormVariable) => {
          const type = formVariableTypeToVariableType(variable.type);
          return {
            id: variable.id,
            name: variable.name,
            sourceType: ValueSourceMode.custom,
            dataType: type,
            label: variable.label,
            valueSourceType: 'input',
          };
        });
        break;
      case NodeType.Webhook:
        const { variables } = data as WebhookNodeData;
        res.variables = variables.map((v: Variable) => {
          const type = v.dataType || VariableDataType.string;
          return {
            id: v.id,
            name: v.name,
            sourceType: ValueSourceMode.custom,
            dataType: type,
            label: v.label,
            options: v.options,
            required: v.required,
            valueSourceType: 'input'
          } as Variable;
        });
        break;
      case NodeType.HttpRequest:
        res.variables = HTTP_REQUEST_OUTPUT_VARIABLES;
        break;
      case NodeType.KnowledgeRetrieval:
        res.variables = KNOWLEDGE_RETRIEVAL_OUTPUT_VARIABLES;
        break;
      case NodeType.LLM:
        res.variables = LLM_OUTPUT_VARIABLES;
        break;
      case NodeType.Code:
        const { outputs } = data as CodeNodeData;
        res.variables = outputs ?
          Object.keys(outputs).map((key: string) => {
            const v = outputs[key];
            return {
              id: v.id,
              name: v.name,
              sourceType: ValueSourceMode.variable,
              dataType: v.type,
              label: v.name,
              valueSourceType: 'node-output',
            } as Variable;
          }) : []
        break;
      case NodeType.TemplateTransform:
        res.variables = TEMPLATE_TRANSFORM_OUTPUT_VARIABLES;
        break;
      case NodeType.VariableAssigner:
        break;
      case NodeType.VariableAggregator:
        break;
      case NodeType.ListOperator:
        break;
      case NodeType.ParameterExtractor:
        {
          const parameters = normalizeParameterExtractorItems((data as ParameterExtractorNodeData).parameters);
          res.variables = [
            ...parameters
              .filter((parameter) => parameter.name?.trim())
              .map((parameter) => ({
                id: parameter.name,
                name: parameter.name,
                sourceType: ValueSourceMode.variable,
                dataType: parameter.type || VariableDataType.string,
                label: parameter.description || parameter.name,
                valueSourceType: 'node-output',
              } as Variable)),
            {
              id: '_isSuccess',
              name: '_isSuccess',
              sourceType: ValueSourceMode.variable,
              dataType: VariableDataType.boolean,
              label: t('workflow.nodes.parameter-extractor.outputFieldIsSuccess'),
              valueSourceType: 'node-output',
            },
            {
              id: '_errorMessage',
              name: '_errorMessage',
              sourceType: ValueSourceMode.variable,
              dataType: VariableDataType.string,
              label: t('workflow.nodes.parameter-extractor.outputFieldErrorMessage'),
              valueSourceType: 'node-output',
            },
            {
              id: '_usage',
              name: '_usage',
              sourceType: ValueSourceMode.variable,
              dataType: VariableDataType.object,
              label: t('workflow.nodes.parameter-extractor.outputFieldUsage'),
              valueSourceType: 'node-output',
            },
          ];
        }
        break;
      case NodeType.DocExtractor:
        res.variables = [
          {
            id: 'docExtractor',
            name: (data as DocumentExtractorNodeData).outputVariableName || DEFAULT_OUTPUT_VARIABLE_NAME,
            sourceType: ValueSourceMode.variable,
            dataType: (data as DocumentExtractorNodeData).isArrayFile
              ? VariableDataType.array
              : VariableDataType.string,
            valueSourceType: 'node-output',
          } as Variable
        ];
        break;
      case NodeType.Agent:
        break;
      case NodeType.Loop:
        res.isLoop = true;
        // todo
        break;
      case VariableGroup.env:
        res.variables = data.envVariables.map((env: WorkflowEnvVariable) => {
          return {
            id: env.id,
            name: `env.${env.name}`,
            sourceType: ValueSourceMode.custom,
            dataType: env.type,
            label: env.name,
            value: env.value,
            valueSourceType: data.type
          }
        })
        break;
      case VariableGroup.session:
        res.variables = data.chatEnvVariables.map((env: WorkflowChatEnvVariable) => {
          return {
            id: env.id,
            name: `session.${env.name}`,
            sourceType: ValueSourceMode.custom,
            dataType: env.type,
            label: env.name,
            value: env.value,
            valueSourceType: data.type
          }
        });
        break;
      case VariableGroup.system:
        res.variables = data.globalVariables.map((env: Variable) => {
          return {
            ...env,
            name: `system.${env.name}`,
            label: env.label ? t(env.label) : env.label,
          }
        });
        break;
      case VariableGroup.nodeOutput:
        break;
      default:
        break;
    }
    res.variables = res.variables.filter((v) => {
      const matched = filterVariable(
        v,
        { nodeId: v.variableSelector?.nodeId || '', path: v.variableSelector?.path || [] }
      );
      if (matched)
        return true;
      return false;
    });
    return res;
  }, []);

  // 获取节点的变量列表
  const getNodeVariableSelectors = useCallback((node: Node) => {
    const { data } = node;
    const dataType = data.type as string;
    let res: VariableSelector[];
    switch (dataType) {
      case NodeType.IfElse:
      case NodeType.Filter:
        res = (data as IfElseNodeData).branches?.flatMap((branch) => {
          if (!branch) return [];
          return branch.conditionGroup.conditions.flatMap((condition) => {
            return condition.variableSelector || [];
          });
        }) || [];
        break;
      case NodeType.DocExtractor:
        res = [(data as DocumentExtractorNodeData).inputVariable].filter(
          (selector): selector is VariableSelector => Boolean(selector)
        );
        break;
      case NodeType.KnowledgeRetrieval:
        res = [(data as KnowledgeRetrievalNodeData).inputVariable].filter(
          (selector): selector is VariableSelector => Boolean(selector)
        );
        break;
      case NodeType.ListOperator:
        res = [(data as ListOperatorNodeData).inputVariable].filter(
          (selector): selector is VariableSelector => Boolean(selector)
        );
        break;
      case NodeType.ParameterExtractor:
        res = [(data as ParameterExtractorNodeData).inputVariable].filter(
          (selector): selector is VariableSelector => Boolean(selector)
        );
        break;
      case NodeType.QuestionClassifier:
        res = [(data as QuestionClassifierNodeData).inputVariable].filter(
          (selector): selector is VariableSelector => Boolean(selector)
        );
        break;
      case NodeType.LLM:
        res = [(data as LLMNodeData).inputVariable].filter(
          (selector): selector is VariableSelector => Boolean(selector)
        );
        break;
      case NodeType.VariableAggregator:
        res = ((data as VariableAggregatorNodeData).variables ?? [])
          .map((item) => item.valueSource)
          .filter((selector): selector is VariableSelector => Boolean(selector));
        break;
      case NodeType.End:
        res = ((data as EndNodeType).outputs ?? [])
          .map((output) => output.valueSelector)
          .filter((selector): selector is VariableSelector => Boolean(selector));
        break;
      default:
        return [];
    }
    return res;
  }, []);

  return {
    getSystemVariables,
    getNodeOutputVariable,
    getNodeVariableSelectors,
  }
}