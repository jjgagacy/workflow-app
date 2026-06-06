import type { NodeDefaultData } from "../../types";
import { WORKFLOW_MODEL_DEFAULT_ID } from "../../components/nodes-shared/model-options";
import type { QuestionClassifierCategory, QuestionClassifierNodeData } from "./types";

const createId = (prefix: string) => `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

export const createQuestionClassifierCategory = (name?: string): QuestionClassifierCategory => ({
  id: createId('question-classifier-category'),
  name: name || '',
  prompt: '',
});

export const getQuestionClassifierCategoryDefaultName = (index: number) => `类别 ${index + 1}`;

export const normalizeQuestionClassifierCategories = (categories?: QuestionClassifierCategory[]) => {
  const list = (categories ?? []).filter(Boolean);
  if (!list.length) {
    return [createQuestionClassifierCategory('类别 1'), createQuestionClassifierCategory('类别 2')];
  }

  return list;
};

export const questionClassifierNodeDefaultData: NodeDefaultData<QuestionClassifierNodeData> = {
  value: {
    modelId: WORKFLOW_MODEL_DEFAULT_ID,
    inputVariable: 'input',
    categories: normalizeQuestionClassifierCategories(),
  },
};
