import { animated, useSpring } from "@react-spring/web";
import { Link } from "react-router-dom";
import '../../css/not-authenticated.css'

export const NotAuthenticatedPage = () => {
  const springs = useSpring({
    from: {
      opacity: 0,
      transform: "translateY(50px)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0)",
    },
  });

  return (
    <animated.div className="not-authenticated-container" style={springs}>
      <span>Ви не увійшли в систему або ваша сесія закінчилась</span>
      <Link to="/login" className="go-to-login-btn">Увійти</Link>
    </animated.div>
  );
};
