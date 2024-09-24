// types.ts

export interface Question {
    id: number;
    order: number;
    question: string;
    options: string[];
    answer: string;
    url: string;
    explanation: string;
    discussion_link: string;
    userSelectedOption: string | null;
    hasMathContent: boolean;
  }  