import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "../types";

const getNodeSize = (node: Node) => ({
  width: node.measured?.width || node.width || node.data?.size?.width || 180,
  height: node.measured?.height || node.height || node.data?.size?.height || 64,
});

export const getLayoutedNodes = (nodes: Node[], edges: Edge[]) => {
  const graph = new dagre.graphlib.Graph();

  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: 'TB',
    ranksep: 56,
    nodesep: 40,
    marginx: 24,
    marginy: 24,
  });

  nodes.forEach((node) => {
    const { width, height } = getNodeSize(node);
    graph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    if (edge.source && edge.target) {
      graph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(graph);

  return nodes.map((node) => {
    const position = graph.node(node.id);

    if (!position) {
      return node;
    }

    const { width, height } = getNodeSize(node);

    return {
      ...node,
      position: {
        x: position.x - width / 2,
        y: position.y - height / 2,
      },
    };
  });
};