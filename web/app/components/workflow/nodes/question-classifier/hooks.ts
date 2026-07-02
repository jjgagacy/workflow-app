import { useTranslation } from "react-i18next";
import { QuestionClassifierCategory } from "./types";


const createId = (prefix: string) => `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

// 创建分类的工厂函数
export const createQuestionClassifierCategory = (name: string): QuestionClassifierCategory => ({
  id: createId('question-classifier-category'),
  name: name || '',
  prompt: '',
});

export const useQuestionClassifier = () => {
  const { t } = useTranslation();

  // 获取分类默认名称
  const getDefaultCategoryName = (index: number): string => {
    return t('workflow.nodes.question-classifier.category', { index: index + 1 });
  };

  // 规范化分类列表
  const normalizeCategories = (categories?: QuestionClassifierCategory[]): QuestionClassifierCategory[] => {
    const list = (categories ?? []).filter(Boolean);
    if (!list.length) {
      return [
        createQuestionClassifierCategory(getDefaultCategoryName(0)),
        createQuestionClassifierCategory(getDefaultCategoryName(1)),
      ];
    }
    return list;
  };

  return {
    getDefaultCategoryName,
    normalizeCategories,
    createCategory: createQuestionClassifierCategory,
  };
};