import { animated, useSpring } from "@react-spring/web";
import DownArrowIcon from "../../../../assets/icon_components/DownArrowIcon";

const ToChatBottomButton = (props: any) => {
  const springs = useSpring({
    from: {
      transform: "translateY(10%)",
      opacity: 0
    },
    to: {
      transform: "translateY(0)",
      opacity: 1
    },
    config: { duration: 200 },
  });
  return (
    <animated.button className="to-bottom-btn" {...props} style={springs}>
      <DownArrowIcon />
    </animated.button>
  );
};
export default ToChatBottomButton;
