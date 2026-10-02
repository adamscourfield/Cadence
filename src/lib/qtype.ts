import type { QuestionTarget, QuestionType } from "./types";

export const QTYPE_COLOR: Record<QuestionType, string> = {
  "higher-order": "var(--lime)",
  open: "var(--cyan)",
  closed: "var(--violet)",
  procedural: "var(--dim)",
  rhetorical: "var(--amber)",
};

/** Only cold-call and hands-up are worth flagging in the UI; "unspecified" is the silent default. */
export const TARGET_LABEL: Partial<Record<QuestionTarget, string>> = {
  "cold-call": "cold call",
  "hands-up": "hands up",
};
