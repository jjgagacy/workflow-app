import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { KnowledgeBaseOption, KnowledgeBaseSelection } from "./types";

const createId = (prefix: string) =>
  `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

export const useKnowledgeRetrieval = () => {
  const { t } = useTranslation();

  const knowledgeBaseOptions = useMemo<KnowledgeBaseOption[]>(
    () => [
      {
        id: 'kb:product-docs',
        name: '产品文档库',
        description: '包含产品功能、配置与使用说明。',
      },
      {
        id: 'kb:faq-center',
        name: 'FAQ 知识库',
        description: '常见问题及标准答复。',
      },
      {
        id: 'kb:policy-center',
        name: '政策制度库',
        description: '业务规则、协议条款和政策文档。',
      },
      {
        id: 'kb:operation-guide',
        name: '运营手册库',
        description: '内部流程与操作指南。',
      },
    ],
    [t],
  );

  const createKnowledgeBaseSelection = (): KnowledgeBaseSelection => ({
    id: createId("knowledge-base-selection"),
    knowledgeBaseId: knowledgeBaseOptions[0]?.id ?? "",
  });

  const normalizeKnowledgeBaseSelections = (
    items?: KnowledgeBaseSelection[],
  ) => {
    const list = (items ?? []).filter(Boolean);

    if (list.length) {
      return list;
    }

    return [createKnowledgeBaseSelection()];
  };

  return {
    knowledgeBaseOptions,
    createKnowledgeBaseSelection,
    normalizeKnowledgeBaseSelections,
  };
};