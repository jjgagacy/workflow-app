import type { NodeData, VariableSelector } from "../../types";

export type QuestionClassifierCategory = {
  id: string;
  name: string;
  prompt: string;
};

export type QuestionClassifierNodeData = NodeData<{
  modelId?: string;
  inputVariable?: VariableSelector;
  categories?: QuestionClassifierCategory[];
}>;
