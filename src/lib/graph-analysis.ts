import type {CaseNodeType} from "@/lib/case-types";

export type EditorNode = {
  id: string;
  type: CaseNodeType;
  title: string;
  content: string | null;
  x: number;
  y: number;
};

export type EditorEdge = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label: string | null;
};

export function analyzeGraph(nodes: EditorNode[], edges: EditorEdge[]) {
  const degree = new Map(nodes.map((node) => [node.id, 0]));

  for (const edge of edges) {
    degree.set(edge.sourceNodeId, (degree.get(edge.sourceNodeId) ?? 0) + 1);
    degree.set(edge.targetNodeId, (degree.get(edge.targetNodeId) ?? 0) + 1);
  }

  const isolatedIds = nodes
    .filter((node) => (degree.get(node.id) ?? 0) === 0)
    .map((node) => node.id);
  const criticalIds = nodes
    .filter((node) => (degree.get(node.id) ?? 0) >= 3)
    .map((node) => node.id);

  const byType = nodes.reduce<Record<CaseNodeType, number>>(
    (acc, node) => {
      acc[node.type] += 1;
      return acc;
    },
    {TASK: 0, BUG: 0, PERSON: 0, EVENT: 0}
  );

  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    isolatedIds,
    criticalIds,
    byType
  };
}

export function getSuggestedLinks(nodes: EditorNode[], edges: EditorEdge[]) {
  const existing = new Set(
    edges.flatMap((edge) => [
      `${edge.sourceNodeId}:${edge.targetNodeId}`,
      `${edge.targetNodeId}:${edge.sourceNodeId}`
    ])
  );

  const suggestions: Array<{
    source: EditorNode;
    target: EditorNode;
    reason: string;
  }> = [];

  for (const source of nodes) {
    const sourceText = `${source.title} ${source.content ?? ""}`.toLowerCase();

    for (const target of nodes) {
      if (source.id === target.id || existing.has(`${source.id}:${target.id}`)) {
        continue;
      }

      const targetTitle = target.title.trim().toLowerCase();
      if (targetTitle.length >= 3 && sourceText.includes(targetTitle)) {
        suggestions.push({
          source,
          target,
          reason: `"${target.title}"`
        });
      }
    }
  }

  return suggestions.slice(0, 5);
}
