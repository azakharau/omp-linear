import type { ToolApproval, ToolApprovalDecision } from "@oh-my-pi/pi-agent-core";
import type { OperationDescriptor } from "./schema/catalog";
import { classifyRawDocument } from "./schema/raw";

/**
 * Every Linear tool declares a host approval tier and nothing else: the host's `tools.approvalMode`
 * and per-tool policies decide whether to prompt, allow, or deny. Nothing here can auto-approve.
 * Ergonomic ops carry their own `tier`, which is passed through unchanged.
 */
export function typedApproval(descriptor: Pick<OperationDescriptor, "kind">): ToolApprovalDecision {
 return descriptor.kind === "Query" ? "read" : "write";
}

/**
 * Raw documents are classified by parsing them against the pinned schema. A document that cannot be
 * classified is treated as a write: the execute path reports the parse error, the gate never widens.
 */
export const rawApproval: ToolApproval = args => {
 const input = args as { document?: unknown; operationName?: unknown } | null;
 if (!input || typeof input.document !== "string") return "write";
 try {
  const operationName = typeof input.operationName === "string" ? input.operationName : undefined;
  return classifyRawDocument(input.document, operationName).tier;
 } catch {
  return "write";
 }
};
