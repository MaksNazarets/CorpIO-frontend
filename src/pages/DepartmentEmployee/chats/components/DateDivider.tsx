import { animated, useSpring } from "@react-spring/web";

type Props = {
  timestamp: string;
};

export const DateDivider = ({ timestamp }: Props) => {
  const springs = useSpring({
    from: {
      opacity: 0,
      transform: "translateY(3px)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0)",
    },
    config:{duration: 200}
  });
  
  return (
    <animated.div className="date-divider" style={springs}>
      {timestamp}
    </animated.div>
  );
};
