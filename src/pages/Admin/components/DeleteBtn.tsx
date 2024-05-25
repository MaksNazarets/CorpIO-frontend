type Props = {
  text?: string;
  onClick: () => void;
};

export const DeleteBtn = ({ text = "Видалити", onClick }: Props) => {
  return (
    <button type="button" className="admin-btn delete-btn" onClick={onClick}>
      {text}
    </button>
  );
};
