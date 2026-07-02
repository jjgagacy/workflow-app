import type { NodeDefaultData } from "../../types";
import { WORKFLOW_MODEL_DEFAULT_ID } from "../../components/nodes-shared/model-options";
import type { QuestionClassifierNodeData } from "./types";

export const questionClassifierNodeDefaultData: NodeDefaultData<QuestionClassifierNodeData> = {
  value: {
    modelId: WORKFLOW_MODEL_DEFAULT_ID,
    inputVariable: 'input',
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
};
