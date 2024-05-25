import { animated, useSpring } from "@react-spring/web";
import { Link } from "react-router-dom";

type Props = {
  id: number;
  name: string;
  head: {
    id: number;
    name: string;
  } | null;
};

export const DepartmentItem = (props: Props) => {
  const springs = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  return (
    <animated.div className="department-item" style={springs}>
      <div className="top-section">
        <span className="department-name">{props.name}</span>
      </div>
      <div className="bottom-section">
        <div>
          <span className="head-label">Голова:</span>
          <span className="department-head">{props.head?.name}</span>
        </div>

        <Link to={`${props.id}`} className="change-btn">
          Змінити
        </Link>
      </div>
    </animated.div>
  );
};
