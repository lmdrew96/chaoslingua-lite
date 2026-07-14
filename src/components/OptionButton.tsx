interface OptionButtonProps {
  option: string;
  answer: string;
  answered: boolean;
  chosen: string | null;
  onClick: () => void;
}

export function OptionButton({ option, answer, answered, chosen, onClick }: OptionButtonProps) {
  const classes = ['option-btn'];
  if (answered) {
    if (option === answer) classes.push('correct');
    else if (option === chosen) classes.push('incorrect');
  }
  return (
    <button className={classes.join(' ')} disabled={answered} onClick={onClick}>
      {option}
    </button>
  );
}
