// 前後端共用的面試資料型別

export const DEFAULT_QUESTIONS = 3;
export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 10;

// BYOK：前端把使用者的 Gemini 金鑰放在這個標頭送給 /api/interview
export const API_KEY_HEADER = "x-gemini-api-key";

export type Role = "interviewer" | "candidate";

export type Message = {
  role: Role;
  content: string;
};

export type InterviewRequest = {
  jobDescription: string;
  totalQuestions: number;
  messages: Message[];
};

export type QuestionReview = {
  question: string;
  answer: string;
  feedback: string;
  betterAnswer: string;
};

export type Evaluation = {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  questionReviews: QuestionReview[];
};

export type InterviewResponse =
  | { type: "question"; questionNumber: number; content: string }
  | { type: "evaluation"; evaluation: Evaluation };
