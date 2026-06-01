"use client";

import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type NodeTypes,
  type OnSelectionChangeParams
} from "@xyflow/react";
import dagre from "dagre";
import {
  BrainCircuit,
  Focus,
  Link2,
  Plus,
  Route,
  Save,
  Search,
  Trash2
} from "lucide-react";
import {useEffect, useMemo, useState, useTransition} from "react";
import {
  createEdgeAction,
  createNodeAction,
  deleteEdgeAction,
  deleteNodeAction,
  saveNodePositionsAction,
  updateNodeAction
} from "@/lib/actions/board-actions";
import {
  caseNodeTypes,
  isCaseNodeType,
  nodeTypeColors,
  type CaseNodeType
} from "@/lib/case-types";
import {
  analyzeGraph,
  getSuggestedLinks,
  type EditorEdge,
  type EditorNode
} from "@/lib/graph-analysis";
import type {Locale} from "@/i18n/routing";
import {ClueNode} from "./clue-node";

const nodeTypes: NodeTypes = {
  clue: ClueNode
};

type EditorCopy = {
  addNode: string;
  empty: string;
  emptyHint: string;
  nodeTitle: string;
  nodeContent: string;
  nodeType: string;
  save: string;
  delete: string;
  analysis: string;
  totalNodes: string;
  totalEdges: string;
  isolated: string;
  critical: string;
  reorder: string;
  focus: string;
  focusOff: string;
  searchNode: string;
  suggestions: string;
  connect: string;
  saving: string;
  saved: string;
  selectNode: string;
  typeLabels: Record<CaseNodeType, string>;
};

type GraphEditorProps = {
  boardId: string;
  locale: Locale;
  initialNodes: EditorNode[];
  initialEdges: EditorEdge[];
  copy: EditorCopy;
};

function toFlowNodes(
  editorNodes: EditorNode[],
  analysis: ReturnType<typeof analyzeGraph>,
  copy: EditorCopy,
  focusId: string | null,
  edges: EditorEdge[]
): Node[] {
  const relatedIds = new Set<string>();

  if (focusId) {
    relatedIds.add(focusId);
    for (const edge of edges) {
      if (edge.sourceNodeId === focusId) relatedIds.add(edge.targetNodeId);
      if (edge.targetNodeId === focusId) relatedIds.add(edge.sourceNodeId);
    }
  }

  return editorNodes.map((node) => ({
    id: node.id,
    type: "clue",
    position: {x: node.x, y: node.y},
    data: {
      title: node.title,
      content: node.content,
      type: node.type,
      typeLabel: copy.typeLabels[node.type],
      isCritical: analysis.criticalIds.includes(node.id),
      isIsolated: analysis.isolatedIds.includes(node.id),
      dimmed: focusId ? !relatedIds.has(node.id) : false
    }
  }));
}

function toFlowEdges(editorEdges: EditorEdge[], focusId: string | null): Edge[] {
  return editorEdges.map((edge) => ({
    id: edge.id,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    animated: focusId
      ? edge.sourceNodeId === focusId || edge.targetNodeId === focusId
      : false,
    style: {
      opacity:
        focusId && edge.sourceNodeId !== focusId && edge.targetNodeId !== focusId
          ? 0.18
          : 1
    }
  }));
}

function layoutNodes(editorNodes: EditorNode[], editorEdges: EditorEdge[]) {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({rankdir: "LR", nodesep: 80, ranksep: 120});

  for (const node of editorNodes) {
    graph.setNode(node.id, {width: 220, height: 126});
  }

  for (const edge of editorEdges) {
    graph.setEdge(edge.sourceNodeId, edge.targetNodeId);
  }

  dagre.layout(graph);

  return editorNodes.map((node, index) => {
    const position = graph.node(node.id);

    if (!position) {
      return {
        ...node,
        x: (index % 4) * 300,
        y: Math.floor(index / 4) * 180
      };
    }

    return {
      ...node,
      x: position.x - 110,
      y: position.y - 63
    };
  });
}

function GraphEditorInner({
  boardId,
  copy,
  initialEdges,
  initialNodes,
  locale
}: GraphEditorProps) {
  const [editorNodes, setEditorNodes] = useState(initialNodes);
  const [editorEdges, setEditorEdges] = useState(initialEdges);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [newType, setNewType] = useState<CaseNodeType>("TASK");
  const [saveStatus, setSaveStatus] = useState(copy.saved);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const reactFlow = useReactFlow();

  const analysis = useMemo(
    () => analyzeGraph(editorNodes, editorEdges),
    [editorEdges, editorNodes]
  );
  const suggestions = useMemo(
    () => getSuggestedLinks(editorNodes, editorEdges),
    [editorEdges, editorNodes]
  );

  const flowNodes = useMemo(
    () => toFlowNodes(editorNodes, analysis, copy, focusId, editorEdges),
    [analysis, copy, editorEdges, editorNodes, focusId]
  );
  const flowEdges = useMemo(
    () => toFlowEdges(editorEdges, focusId),
    [editorEdges, focusId]
  );
  const [nodes, setNodes, onNodesChangeBase] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowEdges, flowNodes, setEdges, setNodes]);

  const selectedNode = editorNodes.find((node) => node.id === selectedNodeId);

  function markSaving() {
    setSaveStatus(copy.saving);
  }

  function markSaved() {
    setSaveStatus(copy.saved);
  }

  function onNodesChange(changes: NodeChange[]) {
    onNodesChangeBase(changes);
    setEditorNodes((current) =>
      current.map((node) => {
        const change = changes.find(
          (candidate) => candidate.type === "position" && candidate.id === node.id
        );

        if (change?.type === "position" && change.position) {
          return {...node, x: change.position.x, y: change.position.y};
        }

        return node;
      })
    );
  }

  async function savePosition(node: Node) {
    markSaving();
    await fetch(`/api/boards/${boardId}/nodes/${node.id}/position`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(node.position)
    });
    markSaved();
  }

  function addNode() {
    startTransition(async () => {
      markSaving();
      const node = await createNodeAction(locale, boardId, {
        type: newType,
        title: copy.typeLabels[newType],
        content: "",
        x: 80 + editorNodes.length * 24,
        y: 80 + editorNodes.length * 18
      });
      setEditorNodes((current) => [
        ...current,
        {
          id: node.id,
          type: node.type as CaseNodeType,
          title: node.title,
          content: node.content,
          x: node.x,
          y: node.y
        }
      ]);
      setSelectedNodeId(node.id);
      markSaved();
    });
  }

  function updateSelected(formData: FormData) {
    if (!selectedNode) return;

    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const typeValue = String(formData.get("type") ?? selectedNode.type);
    const type = isCaseNodeType(typeValue) ? typeValue : selectedNode.type;

    if (!title) return;

    startTransition(async () => {
      markSaving();
      const updated = await updateNodeAction(locale, boardId, selectedNode.id, {
        title,
        content,
        type
      });
      setEditorNodes((current) =>
        current.map((node) =>
          node.id === updated.id
            ? {
                id: updated.id,
                type: updated.type as CaseNodeType,
                title: updated.title,
                content: updated.content,
                x: updated.x,
                y: updated.y
              }
            : node
        )
      );
      markSaved();
    });
  }

  function deleteSelectedNode() {
    if (!selectedNode) return;

    startTransition(async () => {
      markSaving();
      await deleteNodeAction(locale, boardId, selectedNode.id);
      setEditorNodes((current) =>
        current.filter((node) => node.id !== selectedNode.id)
      );
      setEditorEdges((current) =>
        current.filter(
          (edge) =>
            edge.sourceNodeId !== selectedNode.id &&
            edge.targetNodeId !== selectedNode.id
        )
      );
      setSelectedNodeId(null);
      markSaved();
    });
  }

  function connectNodes(connection: Connection) {
    if (!connection.source || !connection.target) return;

    startTransition(async () => {
      markSaving();
      const edge = await createEdgeAction(
        locale,
        boardId,
        connection.source!,
        connection.target!
      );
      setEditorEdges((current) => [
        ...current.filter((item) => item.id !== edge.id),
        {
          id: edge.id,
          sourceNodeId: edge.sourceNodeId,
          targetNodeId: edge.targetNodeId,
          label: edge.label
        }
      ]);
      setEdges((current) => addEdge({...connection, id: edge.id}, current));
      markSaved();
    });
  }

  function deleteSelectedEdge() {
    if (!selectedEdgeId) return;

    startTransition(async () => {
      markSaving();
      await deleteEdgeAction(locale, boardId, selectedEdgeId);
      setEditorEdges((current) =>
        current.filter((edge) => edge.id !== selectedEdgeId)
      );
      setSelectedEdgeId(null);
      markSaved();
    });
  }

  function reorderEvidence() {
    const nextNodes = layoutNodes(editorNodes, editorEdges);
    setEditorNodes(nextNodes);
    setNodes(
      nextNodes.map((node) => ({
        id: node.id,
        type: "clue",
        position: {x: node.x, y: node.y},
        data: {}
      }))
    );

    startTransition(async () => {
      markSaving();
      await saveNodePositionsAction(
        locale,
        boardId,
        nextNodes.map((node) => ({id: node.id, x: node.x, y: node.y}))
      );
      reactFlow.fitView({padding: 0.2, duration: 400});
      markSaved();
    });
  }

  function onSelectionChange(selection: OnSelectionChangeParams) {
    setSelectedNodeId(selection.nodes[0]?.id ?? null);
    setSelectedEdgeId(selection.edges[0]?.id ?? null);
  }

  function focusSearchResult() {
    const found = editorNodes.find((node) =>
      `${node.title} ${node.content ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );

    if (found) {
      reactFlow.setCenter(found.x + 110, found.y + 64, {
        zoom: 1.2,
        duration: 500
      });
      setSelectedNodeId(found.id);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-96px)] gap-4 lg:grid-cols-[1fr_340px]">
      <section className="relative overflow-hidden rounded-lg border border-[var(--cb-border)]">
        {editorNodes.length === 0 ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-8 text-center">
            <div className="max-w-sm rounded-lg border border-[var(--cb-border)] bg-[rgba(15,17,16,0.84)] p-6">
              <p className="text-xl font-black">{copy.empty}</p>
              <p className="mt-2 text-[var(--cb-muted)]">{copy.emptyHint}</p>
            </div>
          </div>
        ) : null}

        <ReactFlow
          edges={edges}
          fitView
          nodeTypes={nodeTypes}
          nodes={nodes}
          onConnect={connectNodes}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={(_, node) => savePosition(node)}
          onNodesChange={onNodesChange}
          onSelectionChange={onSelectionChange}
        >
          <Background color="#3f4844" gap={28} />
          <Controls />
          <MiniMap
            maskColor="rgba(15,17,16,0.72)"
            nodeColor={(node) => {
              const type = node.data?.type as CaseNodeType | undefined;
              return type ? nodeTypeColors[type] : "#5f858c";
            }}
          />
        </ReactFlow>
      </section>

      <aside className="grid content-start gap-4">
        <div className="panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow">{saveStatus}</p>
            <Save className="h-4 w-4 text-[var(--cb-muted)]" />
          </div>
          <div className="mt-4 flex gap-2">
            <select
              className="select"
              onChange={(event) =>
                setNewType(
                  isCaseNodeType(event.target.value) ? event.target.value : "TASK"
                )
              }
              value={newType}
            >
              {caseNodeTypes.map((type) => (
                <option key={type} value={type}>
                  {copy.typeLabels[type]}
                </option>
              ))}
            </select>
            <button
              className="button"
              disabled={isPending}
              onClick={addNode}
              type="button"
            >
              <Plus className="h-4 w-4" />
              {copy.addNode}
            </button>
          </div>
        </div>

        <div className="panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-black">{copy.analysis}</h2>
            <BrainCircuit className="h-5 w-5 text-[var(--cb-teal)]" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Stat label={copy.totalNodes} value={analysis.totalNodes} />
            <Stat label={copy.totalEdges} value={analysis.totalEdges} />
            <Stat label={copy.isolated} value={analysis.isolatedIds.length} />
            <Stat label={copy.critical} value={analysis.criticalIds.length} />
          </div>
          <button
            className="button secondary mt-3 w-full"
            disabled={isPending || editorNodes.length === 0}
            onClick={reorderEvidence}
            type="button"
          >
            <Route className="h-4 w-4" />
            {copy.reorder}
          </button>
          <button
            className="button secondary mt-2 w-full"
            disabled={!selectedNodeId}
            onClick={() => setFocusId(focusId ? null : selectedNodeId)}
            type="button"
          >
            <Focus className="h-4 w-4" />
            {focusId ? copy.focusOff : copy.focus}
          </button>
        </div>

        <div className="panel p-4">
          <label className="block space-y-2">
            <span className="text-sm font-bold text-[var(--cb-muted)]">
              {copy.searchNode}
            </span>
            <div className="flex gap-2">
              <input
                className="input"
                onChange={(event) => setQuery(event.target.value)}
                value={query}
              />
              <button
                className="button secondary"
                disabled={!query}
                onClick={focusSearchResult}
                type="button"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </label>
        </div>

        <div className="panel p-4">
          <h2 className="font-black">{copy.suggestions}</h2>
          <div className="mt-3 grid gap-2">
            {suggestions.length === 0 ? (
              <p className="text-sm text-[var(--cb-muted)]">-</p>
            ) : (
              suggestions.map((suggestion) => (
                <button
                  className="rounded-md border border-[var(--cb-border)] p-3 text-left text-sm hover:border-[var(--cb-teal)]"
                  key={`${suggestion.source.id}-${suggestion.target.id}`}
                  onClick={() =>
                    connectNodes({
                      source: suggestion.source.id,
                      sourceHandle: null,
                      target: suggestion.target.id,
                      targetHandle: null
                    })
                  }
                  type="button"
                >
                  <span className="font-bold">{suggestion.source.title}</span>
                  <span className="mx-2 text-[var(--cb-muted)]">→</span>
                  <span className="font-bold">{suggestion.target.title}</span>
                  <span className="mt-1 block text-[var(--cb-muted)]">
                    {suggestion.reason}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="panel p-4">
          {selectedNode ? (
            <form action={updateSelected} className="grid gap-3">
              <label className="space-y-2">
                <span className="text-sm font-bold text-[var(--cb-muted)]">
                  {copy.nodeTitle}
                </span>
                <input
                  className="input"
                  defaultValue={selectedNode.title}
                  key={`${selectedNode.id}-title`}
                  name="title"
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold text-[var(--cb-muted)]">
                  {copy.nodeType}
                </span>
                <select
                  className="select"
                  defaultValue={selectedNode.type}
                  key={`${selectedNode.id}-type`}
                  name="type"
                >
                  {caseNodeTypes.map((type) => (
                    <option key={type} value={type}>
                      {copy.typeLabels[type]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold text-[var(--cb-muted)]">
                  {copy.nodeContent}
                </span>
                <textarea
                  className="textarea"
                  defaultValue={selectedNode.content ?? ""}
                  key={`${selectedNode.id}-content`}
                  name="content"
                />
              </label>
              <div className="flex gap-2">
                <button className="button flex-1" disabled={isPending}>
                  {copy.save}
                </button>
                <button
                  className="button danger"
                  disabled={isPending}
                  onClick={deleteSelectedNode}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-[var(--cb-muted)]">{copy.selectNode}</p>
          )}

          {selectedEdgeId ? (
            <button
              className="button danger mt-3 w-full"
              disabled={isPending}
              onClick={deleteSelectedEdge}
              type="button"
            >
              <Link2 className="h-4 w-4" />
              {copy.delete}
            </button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function Stat({label, value}: {label: string; value: number}) {
  return (
    <div className="rounded-md border border-[var(--cb-border)] bg-[rgba(15,17,16,0.42)] p-3">
      <p className="text-xs font-bold text-[var(--cb-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

export function GraphEditor(props: GraphEditorProps) {
  return (
    <ReactFlowProvider>
      <GraphEditorInner {...props} />
    </ReactFlowProvider>
  );
}
