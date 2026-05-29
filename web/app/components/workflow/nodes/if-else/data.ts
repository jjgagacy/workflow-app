import { NodeDefaultData } from "../../types";
import { IfElseNodeData } from "./types";

export const ifElseNodeDefaultData: NodeDefaultData<IfElseNodeData> = {
  value: {
    branches: [
      {
        id: 'branch-1',
        conditionGroup: {
          conditions: [],
          logicalOperator: 'and',
        },
        logicalOperator: 'and',
      }
    ]
  }
};
