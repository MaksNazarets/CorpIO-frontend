import { animated, useSpring } from "@react-spring/web";

export const UnreadMessagesSectionDivider = () => {
  const springs = useSpring({
    from: {
      opacity: 0,
      tramsform: "translateY(3px)",
    },
    to: {
      opacity: 1,
      tramsform: "translateY(0)",
    },
  });

  return (
    <animated.div className="unread-msgs-divider" style={springs}>
      <div className="text">Непрочитані повідомлення</div>
    </animated.div>
  );
};
