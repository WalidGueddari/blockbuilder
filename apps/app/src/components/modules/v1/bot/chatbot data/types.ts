// types.ts
export interface Question {
  question: string;
  choices: string[];
}

export interface Category {
  keywords: string[];
  questions: Question[];
}

export type Responses = Record<string, string>;
