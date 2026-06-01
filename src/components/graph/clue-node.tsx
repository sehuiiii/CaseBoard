"use client";

import {Handle, Position, type NodeProps} from "@xyflow/react";
import {AlertCircle, Star} from "lucide-react";
import {nodeTypeColors, type CaseNodeType} from "@/lib/case-types";

type ClueNodeData = {
  title: string;
  content?: string | null;
  type: CaseNodeType;
  typeLabel: string;
  isCritical: boolean;
  isIsolated: boolean;
  dimmed: boolean;
};

export function ClueNode({data}: NodeProps) {
  const nodeData = data as unknown as ClueNodeData;

  return (
    <div
      className="clue-node"
      data-dimmed={nodeData.dimmed}
      style={{borderLeftColor: nodeTypeColors[nodeData.type]}}
    >
      <Handle position={Position.Left} type="target" />
      <div className="clue-node__body">
        <div className="clue-node__meta">
          <span>{nodeData.typeLabel}</span>
          <span className="flex items-center gap-1">
            {nodeData.isCritical ? <Star className="h-3.5 w-3.5" /> : null}
            {nodeData.isIsolated ? <AlertCircle className="h-3.5 w-3.5" /> : null}
          </span>
        </div>
        <div className="clue-node__title">{nodeData.title}</div>
        {nodeData.content ? (
          <div className="clue-node__content">{nodeData.content}</div>
        ) : null}
      </div>
      <Handle position={Position.Right} type="source" />
    </div>
  );
}
