export interface Drill {
  type: string;
  label: string;
  prompt: string;
  options?: string[];
  answer: string;
  accept?: string[];
}

// What a session actually holds — a Drill plus which chapter produced it, so
// attempts can be logged per-chapter without every generator knowing about that.
export interface GeneratedDrill extends Drill {
  chapter: number;
}

export type DrillGenerator = () => Drill;
