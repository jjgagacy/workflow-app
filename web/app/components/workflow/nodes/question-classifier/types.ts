import type { NodeData } from "../../types";

export type QuestionClassifierCategory = {
  id: string;
  name: string;
  prompt: string;
};

export type QuestionClassifierNodeData = NodeData<{
  modelId?: string;
  inputVariable?: string;
  categories?: QuestionClassifierCategory[];
}>;
