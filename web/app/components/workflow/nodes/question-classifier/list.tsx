import { useTranslation } from "react-i18next";
import DeleteButton from "../../components/base/delete-button";
import { NodeInput } from "../../components/base/node-input";
import { NodeTextarea } from "../../components/base/node-textarea";
import type { QuestionClassifierCategory } from "./types";
import { useQuestionClassifier } from "./hooks";

type CatListProps = {
  categories: QuestionClassifierCategory[];
  onUpdateCategory: (categoryId: string, patch: Partial<QuestionClassifierCategory>) => void;
  onRemoveCategory: (categoryId: string) => void;
};

const ClassifierList = ({ categories, onUpdateCategory, onRemoveCategory }: CatListProps) => {
  const { t } = useTranslation();
  const { getDefaultCategoryName } = useQuestionClassifier();

  return categories.map((category, index) => {
    const name = category.name?.trim() || getDefaultCategoryName(index);

    return (
      <div key={category.id} className="rounded-xl border-l-4 border-[var(--border)] bg-muted/20 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.question-classifier.category', { index: index + 1 })}</div>
          <DeleteButton
            onClick={() => onRemoveCategory(category.id)}
            ariaLabel={t('workflow.nodes.question-classifier.remove-category-aria-label', { index: index + 1 })}
          />
        </div>

        <div className="space-y-3">
          <label className="block">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.question-classifier.category-name')}</div>
            <NodeInput
              value={category.name}
              onChange={(event) => onUpdateCategory(category.id, { name: event.target.value })}
              placeholder={name}
            />
          </label>

          <label className="block">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.question-classifier.category-prompt')}</div>
            <NodeTextarea
              value={category.prompt}
              onChange={(event) => onUpdateCategory(category.id, { prompt: event.target.value })}
              placeholder={t('workflow.nodes.question-classifier.category-prompt-placeholder')}
              rows={3}
              className="min-h-[88px]"
            />
          </label>
        </div>
      </div>
    );
  });
};

export default ClassifierList;