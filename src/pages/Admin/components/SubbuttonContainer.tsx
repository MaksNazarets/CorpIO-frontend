import { useState } from "react";

type Props = {
  parentButton: React.ReactNode;
  children: React.ReactNode;
};

export const SubbuttonContainer = (props: Props) => {
  const [isUnfolded, setIsUnfolded] = useState(false);

  return (
    <div
      className="subbutton-container"
      onClick={() => setIsUnfolded((curr) => !curr)}
    >
      {props.parentButton}
      <div
        className="subbutton-container"
        onClick={() => setIsUnfolded((curr) => !curr)}
      >
        {isUnfolded && props.children}
      </div>
    </div>
  );
};
