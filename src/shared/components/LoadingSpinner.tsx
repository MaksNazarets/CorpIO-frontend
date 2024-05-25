type Props = {
  top?: boolean;
  size?: 1 | 2 | 3;
};

export const LoadingSpinner = ({ top = false, size = 1 }: Props) => {
  return (
    <div className={`loading-spinner ${top ? "top" : ""} size-${size}`}> </div>
  );
};
