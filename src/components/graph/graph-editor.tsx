"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
  MarkerType,
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
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent
} from "react";
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
  edgeDeleteHint: string;
  connectTitle: string;
  connectFrom: string;
  connectTo: string;
  noConnectTarget: string;
  searchResults: string;
  noSearchResults: string;
  saveError: string;
  typeLabels: Record<CaseNodeType, string>;
};

type GraphEditorProps = {
  boardId: string;
  locale: Locale;
  initialNodes: EditorNode[];
  initialEdges: EditorEdge[];
  copy: EditorCopy;
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 126;

function toFlowNodes(
  editorNodes: EditorNode[],
  analysis: ReturnType<typeof analyzeGraph>,
  copy: EditorCopy,
  focusId: string | null,
  edges: EditorEdge[],
  highlightedIds: Set<string>
): Node[] {
  const relatedIds = new Set<string>();

  if (focusId) {
    relatedIds.add(focusId);
    for (const edge of edges) {
      if (edge.sourceNodeId === focusId) relatedIds.add(edge.targetNodeId);
      if (edge.targetNodeId === focusId) relatedIds.add(edge.sourceNodeId);
    }
  }

  return editorNodes.map((node) => {
    const isCritical = analysis.criticalIds.includes(node.id);
    const isIsolated = analysis.isolatedIds.includes(node.id);

    return {
      id: node.id,
      type: "clue",
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      initialWidth: NODE_WIDTH,
      initialHeight: NODE_HEIGHT,
      position: {x: node.x, y: node.y},
      style: {
        minHeight: NODE_HEIGHT,
        visibility: "visible",
        width: NODE_WIDTH
      },
      data: {
        title: node.title,
        content: node.content,
        type: node.type,
        typeLabel: copy.typeLabels[node.type],
        isCritical,
        isIsolated,
        highlighted: highlightedIds.has(node.id),
        dimmed: focusId ? !relatedIds.has(node.id) : false
      }
    }
  });
}

function toFlowEdges(
  editorEdges: EditorEdge[],
  focusId: string | null,
  selectedEdgeId: string | null
): Edge[] {
  return editorEdges.map((edge) => ({
    id: edge.id,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    interactionWidth: 18,
    markerEnd: {
      color: edge.id === selectedEdgeId ? "#d8e9ed" : "#8cb6bf",
      type: MarkerType.ArrowClosed
    },
    animated: focusId
      ? edge.sourceNodeId === focusId || edge.targetNodeId === focusId
      : false,
    style: {
      stroke: edge.id === selectedEdgeId ? "#d8e9ed" : "var(--cb-teal)",
      strokeWidth: edge.id === selectedEdgeId ? 3.5 : 2.5,
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
    graph.setNode(node.id, {width: NODE_WIDTH, height: NODE_HEIGHT});
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
        x: 80 + (index % 4) * (NODE_WIDTH + 80),
        y: 80 + Math.floor(index / 4) * (NODE_HEIGHT + 54)
      };
    }

    return {
      ...node,
      x: position.x - NODE_WIDTH / 2,
      y: position.y - NODE_HEIGHT / 2
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
  const [connectTargetId, setConnectTargetId] = useState("");
  const [isPending, startTransition] = useTransition();
  const reactFlow = useReactFlow();
  const previousNodeCount = useRef(0);

  const analysis = useMemo(
    () => analyzeGraph(editorNodes, editorEdges),
    [editorEdges, editorNodes]
  );
  const suggestions = useMemo(
    () => getSuggestedLinks(editorNodes, editorEdges),
    [editorEdges, editorNodes]
  );
  const normalizedQuery = query.trim().toLowerCase();
  const matchingNodes = useMemo(() => {
    if (!normalizedQuery) return [];

    return editorNodes.filter((node) =>
      `${node.title} ${node.content ?? ""} ${copy.typeLabels[node.type]}`
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [copy.typeLabels, editorNodes, normalizedQuery]);
  const matchingNodeIds = useMemo(
    () => new Set(matchingNodes.map((node) => node.id)),
    [matchingNodes]
  );

  const flowNodes = useMemo(
    () =>
      toFlowNodes(
        editorNodes,
        analysis,
        copy,
        focusId,
        editorEdges,
        matchingNodeIds
      ),
    [analysis, copy, editorEdges, editorNodes, focusId, matchingNodeIds]
  );
  const flowEdges = useMemo(
    () => toFlowEdges(editorEdges, focusId, selectedEdgeId),
    [editorEdges, focusId, selectedEdgeId]
  );
  const selectedNode = editorNodes.find((node) => node.id === selectedNodeId);
  const connectableNodes = useMemo(() => {
    if (!selectedNodeId) return [];

    return editorNodes.filter((node) => {
      if (node.id === selectedNodeId) return false;

      return !editorEdges.some(
        (edge) =>
          (edge.sourceNodeId === selectedNodeId && edge.targetNodeId === node.id) ||
          (edge.sourceNodeId === node.id && edge.targetNodeId === selectedNodeId)
      );
    });
  }, [editorEdges, editorNodes, selectedNodeId]);
  const effectiveConnectTargetId = connectableNodes.some(
    (node) => node.id === connectTargetId
  )
    ? connectTargetId
    : connectableNodes[0]?.id ?? "";

  useEffect(() => {
    if (editorNodes.length > 0 && editorNodes.length !== previousNodeCount.current) {
      window.requestAnimationFrame(() => {
        reactFlow.fitView({duration: 320, padding: 0.22});
      });
    }

    previousNodeCount.current = editorNodes.length;
  }, [editorNodes.length, reactFlow]);

  function markSaving() {
    setSaveStatus(copy.saving);
  }

  function markSaved() {
    setSaveStatus(copy.saved);
  }

  function onNodesChange(changes: NodeChange[]) {
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
        x: 80 + (editorNodes.length % 4) * (NODE_WIDTH + 40),
        y: 80 + Math.floor(editorNodes.length / 4) * (NODE_HEIGHT + 40)
      });
      const nextNode = {
        id: node.id,
        type: node.type as CaseNodeType,
        title: node.title,
        content: node.content,
        x: node.x,
        y: node.y
      };
      setEditorNodes((current) => [
        ...current,
        nextNode
      ]);
      setSelectedNodeId(node.id);
      window.requestAnimationFrame(() => {
        reactFlow.setCenter(nextNode.x + NODE_WIDTH / 2, nextNode.y + NODE_HEIGHT / 2, {
          duration: 360,
          zoom: 1
        });
      });
      markSaved();
    });
  }

  function updateSelected(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedNode) return;

    const formData = new FormData(event.currentTarget);
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
      setSelectedNodeId(updated.id);
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

  function connectNodes(connection: Pick<Connection, "source" | "target">) {
    if (!connection.source || !connection.target) return;
    if (connection.source === connection.target) return;

    startTransition(async () => {
      try {
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
        setSelectedEdgeId(edge.id);
        markSaved();
      } catch {
        setSaveStatus(copy.saveError);
      }
    });
  }

  function connectSelectedNode() {
    if (!selectedNode || !effectiveConnectTargetId) return;

    connectNodes({
      source: selectedNode.id,
      target: effectiveConnectTargetId
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
    const nodeId = selection.nodes[0]?.id;
    const edgeId = selection.edges[0]?.id;

    if (nodeId) {
      setSelectedNodeId(nodeId);
      setSelectedEdgeId(null);
      return;
    }

    if (edgeId) {
      setSelectedEdgeId(edgeId);
      setSelectedNodeId(null);
    }
  }

  function focusSearchResult() {
    const found = matchingNodes[0];

    if (found) {
      reactFlow.setCenter(found.x + NODE_WIDTH / 2, found.y + NODE_HEIGHT / 2, {
        zoom: 1.2,
        duration: 500
      });
      setSelectedNodeId(found.id);
    }
  }

  return (
    <div className="editor-grid">
      <section className="forensic-canvas">
        {editorNodes.length === 0 ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-8 text-center">
            <div className="empty-state max-w-sm rounded-lg p-6">
              <p className="text-xl font-black">{copy.empty}</p>
              <p className="mt-2 text-[var(--cb-muted)]">{copy.emptyHint}</p>
            </div>
          </div>
        ) : null}

        <ReactFlow
          defaultViewport={{x: 80, y: 80, zoom: 1}}
          edges={flowEdges}
          maxZoom={1.8}
          minZoom={0.25}
          nodeTypes={nodeTypes}
          nodes={flowNodes}
          onConnect={connectNodes}
          onEdgeClick={(_, edge) => {
            setSelectedEdgeId(edge.id);
            setSelectedNodeId(null);
          }}
          onEdgesChange={() => undefined}
          onNodeClick={(_, node) => {
            setSelectedNodeId(node.id);
            setSelectedEdgeId(null);
          }}
          onNodeDragStop={(_, node) => savePosition(node)}
          onNodesChange={onNodesChange}
          onPaneClick={() => {
            setSelectedNodeId(null);
            setSelectedEdgeId(null);
          }}
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

      <aside className="editor-sidebar">
        <div className="editor-panel panel">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="status-dot" />
              <p className="eyebrow">{saveStatus}</p>
            </div>
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

        <div className="editor-panel panel">
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

        <div className="editor-panel panel">
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
            {normalizedQuery ? (
              <p className="text-xs font-bold text-[var(--cb-muted)]">
                {matchingNodes.length > 0
                  ? copy.searchResults.replace(
                      "{count}",
                      String(matchingNodes.length)
                    )
                  : copy.noSearchResults}
              </p>
            ) : null}
          </label>
        </div>

        <div className="editor-panel panel">
          <h2 className="font-black">{copy.connectTitle}</h2>
          {selectedNode ? (
            <div className="mt-3 grid gap-3">
              <div className="rounded-md border border-[var(--cb-border)] bg-[rgba(9,13,12,0.42)] p-3 text-sm">
                <p className="text-xs font-bold text-[var(--cb-muted)]">
                  {copy.connectFrom}
                </p>
                <p className="mt-1 font-black">{selectedNode.title}</p>
              </div>
              <label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--cb-muted)]">
                  {copy.connectTo}
                </span>
                <select
                  className="select"
                  disabled={connectableNodes.length === 0 || isPending}
                  onChange={(event) => setConnectTargetId(event.target.value)}
                  value={effectiveConnectTargetId}
                >
                  {connectableNodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.title}
                    </option>
                  ))}
                </select>
              </label>
              {connectableNodes.length === 0 ? (
                <p className="text-sm text-[var(--cb-muted)]">
                  {copy.noConnectTarget}
                </p>
              ) : null}
              <button
                className="button w-full"
                disabled={!effectiveConnectTargetId || isPending}
                onClick={connectSelectedNode}
                type="button"
              >
                <Link2 className="h-4 w-4" />
                {copy.connect}
              </button>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--cb-muted)]">
              {copy.selectNode}
            </p>
          )}
        </div>

        <div className="editor-panel panel">
          <h2 className="font-black">{copy.suggestions}</h2>
          <div className="mt-3 grid gap-2">
            {suggestions.length === 0 ? (
              <p className="text-sm text-[var(--cb-muted)]">-</p>
            ) : (
              suggestions.map((suggestion) => (
                <button
                  className="evidence-link-card text-sm"
                  key={`${suggestion.source.id}-${suggestion.target.id}`}
                  onClick={() =>
                    connectNodes({
                      source: suggestion.source.id,
                      target: suggestion.target.id
                    })
                  }
                  type="button"
                >
                  <span className="font-bold">{suggestion.source.title}</span>
                  <span className="mx-2 text-[var(--cb-muted)]">&rarr;</span>
                  <span className="font-bold">{suggestion.target.title}</span>
                  <span className="mt-1 block text-[var(--cb-muted)]">
                    {suggestion.reason}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="editor-panel panel">
          {selectedNode ? (
            <form
              className="grid gap-3"
              key={selectedNode.id}
              onSubmit={updateSelected}
            >
              <label className="space-y-2">
                <span className="text-sm font-bold text-[var(--cb-muted)]">
                  {copy.nodeTitle}
                </span>
                <input
                  className="input"
                  defaultValue={selectedNode.title}
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
                  name="content"
                />
              </label>
              <div className="flex gap-2">
                <button className="button flex-1" disabled={isPending} type="submit">
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
          ) : selectedEdgeId ? (
            <p className="text-sm text-[var(--cb-muted)]">
              {copy.edgeDeleteHint}
            </p>
          ) : (
            <div className="grid gap-2 text-sm text-[var(--cb-muted)]">
              <p>{copy.selectNode}</p>
              <p>{copy.edgeDeleteHint}</p>
            </div>
          )}

          {selectedEdgeId ? (
            <div className="mt-3">
              <button
                className="button danger w-full"
                disabled={isPending}
                onClick={deleteSelectedEdge}
                type="button"
              >
                <Link2 className="h-4 w-4" />
                {copy.delete}
              </button>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function Stat({label, value}: {label: string; value: number}) {
  return (
    <div className="mini-metric">
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
