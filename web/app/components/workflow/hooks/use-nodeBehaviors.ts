import { useMemo } from "react";
import { NODE_BEHAVIORS } from "../node";
import { produce } from "immer";

export const useNodeBehaviors = () => {
  return useMemo(() => produce(NODE_BEHAVIORS, (draft) => {
    // 可以在这里对 NODE_BEHAVIORS 进行修改或扩展
  }), []);
};
