// types.ts

export type Question = {
    id: number;
    question: string; 
    options: string[];
    answer: string;
    url?: string;
    explanation?: string;
    discussion_link?: string;
    userSelectedOption: string | null;
    hasMathContent: boolean;    
};