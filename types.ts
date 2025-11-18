export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  evidence?: string; // The text segment that proves the answer
}

export interface StoryData {
  title: string;
  content: string;
  questions: Question[];
}

export enum ViewState {
  HOME = 'HOME',
  READING = 'READING',
  GAMES = 'GAMES',
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  badges: string[];
}

export interface Card {
  id: number;
  content: string;
  type: 'verb' | 'complement';
  matchId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export enum GameType {
  NONE = 'NONE',
  MEMORY = 'MEMORY',
  SCRAMBLE = 'SCRAMBLE',
  GAPFILL = 'GAPFILL',
}