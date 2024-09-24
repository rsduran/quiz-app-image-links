// types.ts

export interface Question {
  id: number;
  order: number;
  question: string;
  options: string[];
  originalOptions?: string[]; // Made this optional by adding '?'
  answer: string;
  url?: string;
  explanation: string;
  discussion_link: string;
  userSelectedOption: string | null;
  hasMathContent: boolean;
}