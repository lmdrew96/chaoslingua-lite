export interface Drill {
  type: string;
  label: string;
  prompt: string;
  options?: string[];
  answer: string;
  accept?: string[];
}

export type DrillGenerator = () => Drill;
