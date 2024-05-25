import { animated, useSpring } from "@react-spring/web";
import { Link } from "react-router-dom";

const AddChatMenu = () => {
  const springs = useSpring({
    from: {
      transform: "scale(0)",
    },
    to: {
      transform: "scale(1)",
    },
    config: { duration: 100 },
  });

  return (
    <animated.ul className="create-chat-menu" style={springs}>
      <Link to="/chats/add-private">
        <li>Приватний чат</li>
      </Link>
      <Link to="/chats/add-group">
        <li>Група</li>
      </Link>
      <Link to="/chats/add-channel">
        <li>Канал</li>
      </Link>
    </animated.ul>
  );
};

export default AddChatMenu;
