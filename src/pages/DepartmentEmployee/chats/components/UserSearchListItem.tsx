import { Link } from "react-router-dom";
import { BASE_API_URL } from "../../../../untils";
import { useModalWindowsContext } from "../../../../context/ModalWindowsContext";

type Props = {
  userId: number;
  userName: string;
  userUsername: string;
  department: string;
  position: string;
  chatId?: number;
  startNewChatFn?: (userId: number) => void;
};

const UserSearchListItem = (props: Props) => {
  const { setProfileViewerUserId } = useModalWindowsContext();

  return (
    <div className="user-item">
      <div
        className="avatar"
        style={{
          backgroundImage: `url(${BASE_API_URL}/users/${props.userId}/avatar)`,
        }}
      ></div>
      <div className="user-item__middle-section">
        <span className="name">{props.userName}</span>
        <span>@{props.userUsername}</span>
        <span>{props.department}</span>
        <span>{props.position}</span>
      </div>
      <div className="user-item__end-section">
        {props.chatId ? (
          <Link to={`/chats/p/${props.chatId}`}>Відкрити чат</Link>
        ) : (
          <a onClick={() => props.startNewChatFn?.(props.userId)}>Почати чат</a>
        )}

        <a className="secondary" onClick={() => setProfileViewerUserId(props.userId)}>Профіль</a>
      </div>
    </div>
  );
};

export default UserSearchListItem;
