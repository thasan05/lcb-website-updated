export type LorQuestionType = "text" | "textarea" | "select" | "radio";

export interface LorQuestion {
  id: string;
  type: LorQuestionType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  order: number;
}

export interface LorConfig {
  open: boolean;
  closedMessage: string;
  rules: string[];
  questions: LorQuestion[];
}

export interface LorSubmission {
  id: string;
  answers: Record<string, string>;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
}
