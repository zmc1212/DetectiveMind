export enum GamePhase {
  MENU = 'MENU',
  LOADING = 'LOADING',
  DASHBOARD = 'DASHBOARD',
  INTERROGATION = 'INTERROGATION',
  SOLVING = 'SOLVING',
  RESULT = 'RESULT',
}

export enum Difficulty {
  EASY = '简单',
  MEDIUM = '普通',
  HARD = '困难',
}

export interface Suspect {
  id: string;
  name: string;
  role: string; // e.g., "Butler", "Daughter"
  description: string;
  avatarStyle: string; // prompting hint for UI or placeholder choice
  secret: string; // Hidden info
  personality: string;
}

export interface CaseData {
  title: string;
  introduction: string; // The "Crime Scene" description
  solution: string; // Hidden
  difficulty: Difficulty;
  suspects: Suspect[];
}

export interface Message {
  id: string;
  sender: 'user' | 'suspect' | 'system';
  content: string;
  timestamp: number;
}

export interface EvaluationResult {
  correct: boolean;
  feedback: string;
  percentage: number;
}