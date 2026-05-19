import { useMemo } from "react";
import { useTranslation } from "react-i18next"
import { produce } from 'immer'
import { NODES_DATA } from "../data";
import { NodeCatalog } from "../types";

export const useNodesData = () => {
  const { t } = useTranslation();

  return useMemo(() => produce(NODES_DATA, (draft) => {
    draft.forEach(node => {
      node.name = t(`workflow.nodes.${node.id}.name`);
      node.description = t(`workflow.nodes.${node.id}.description`);
      node.section = t(`workflow.sections.${node.section}`);
    });
  }), [t]);
}

export const useAvailableNodes = () => {
  const nodesData = useNodesData();
  return useMemo(() => {
    return nodesData;
  }, [nodesData]);
}
