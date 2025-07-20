export type Message = {
  _id: string;
  sessionId: string;
  role: "user" | "detroit-ai" | "system";
  content: string;
  createdAt: Date;
  metadata?: {
    tokenCount?: number;
    functionCall?: Record<string, any>;
    responseTimeMs?: number;
    [key: string]: any;
  };
};