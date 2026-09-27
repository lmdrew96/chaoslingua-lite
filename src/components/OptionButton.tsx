interface OptionButtonProps {
  option: string;
  answer: string;
  answered: boolean;
  chosen: string | null;
  hotkey: number;
  onClick: () => void;
}

export function OptionButton({ option, answer, answered, chosen, hotkey, onClick }: OptionButtonProps) {
  const classes = ['option-btn'];
  if (answered) {
    if (option === answer) classes.push('correct');
    else if (option === chosen) classes.push('incorrect');
  }
  return (
    <button className={classes.join(' ')} disabled={answered} onClick={onClick}>
      <kbd className="opt-key" aria-hidden="true">{hotkey}</kbd>
      <span>{option}</span>
    </button>
  );
}
