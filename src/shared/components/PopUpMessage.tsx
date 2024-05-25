import { useSpring, animated } from "@react-spring/web";

type Props = {
  text: string;
  type: "success" | "warning" | "error";
};

export const PopUpMessage = ({ text, type = "success" }: Props) => {
  const animationProps = useSpring({
    from: {
      opacity: 0,
      transform: "translateX(-50%)",
      y: -50
    },
    to:{
      opacity: 1,
      transform: "translateX(-50%)",
      y: 0
    }
  });

  return <animated.div className={`popup-msg ${type}`} style={animationProps}>{text}</animated.div>;
};
