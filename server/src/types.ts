export type Feed = 'top' | 'new' | 'best';

export interface Story {
  id: number;
  title: string;
  by: string;
  score: number;
  time: number;
  descendants: number;
  type: string;
  url?: string;
  text?: string;
}

export interface Comment {
  id: number;
  by: string;
  time: number;
  text: string;
  replies: Comment[];
}

export interface StorySummary {
  summary: string;
  commentsUsed: number;
}
