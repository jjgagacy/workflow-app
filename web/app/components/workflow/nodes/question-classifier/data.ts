import type { NodeDefaultData } from "../../types";
import type { QuestionClassifierNodeData } from "./types";

const normalizeQuestionClassifierCategories = (categories?: QuestionClassifierNodeData['categories']) => {
  return (categories ?? []).filter(Boolean);
};

export const questionClassifierNodeDefaultData: NodeDefaultData<QuestionClassifierNodeData> = {
  value: {
    modelId: '',
    provider: 'OpenAI',
    categories: [
      {
        id: `question-classifier-category:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
        name: 'Category 1',
        prompt: '',
      },
      {
        id: `question-classifier-category:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
        name: 'Category 2',
        prompt: '',
      }
    ]
  },
  validate: function (payload: QuestionClassifierNodeData, t: any, data?: any): { valid: boolean; errorMessage?: string; } {
    if (!payload.modelId) {
      return { valid: false, errorMessage: t('workflow.checkList.error.questionClassifierModelMissing') };
    }

    if (!payload.inputVariable?.nodeId || !payload.inputVariable?.path?.length) {
      return { valid: false, errorMessage: t('workflow.checkList.error.questionClassifierInputVariableMissing') };
    }

    const categories = normalizeQuestionClassifierCategories(payload.categories);
    if (categories.length === 0) {
      return { valid: false, errorMessage: t('workflow.checkList.error.questionClassifierCategoryMissing') };
    }

    for (let index = 0; index < categories.length; index += 1) {
      const category = categories[index];

      if (!category.name?.trim()) {
        return {
          valid: false,
          errorMessage: t('workflow.checkList.error.questionClassifierCategoryNameMissing', { index: index + 1 }),
        };
      }

      if (!category.prompt?.trim()) {
        return {
          valid: false,
          errorMessage: t('workflow.checkList.error.questionClassifierCategoryPromptMissing', { index: index + 1 }),
        };
      }
    }

    return { valid: true };
  }
};
