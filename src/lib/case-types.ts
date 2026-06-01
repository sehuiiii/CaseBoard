export const caseNodeTypes = ["TASK", "BUG", "PERSON", "EVENT"] as const;

export type CaseNodeType = (typeof caseNodeTypes)[number];

export const nodeTypeColors: Record<CaseNodeType, string> = {
  TASK: "#5f858c",
  BUG: "#b64b45",
  PERSON: "#7d6f96",
  EVENT: "#71806f"
};

export function isCaseNodeType(value: string): value is CaseNodeType {
  return caseNodeTypes.includes(value as CaseNodeType);
}
