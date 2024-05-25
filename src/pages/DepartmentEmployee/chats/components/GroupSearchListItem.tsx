import { Link } from "react-router-dom";
import { BASE_API_URL } from "../../../../untils";
import { GroupItem } from "./ChatSearchForm";

const GroupSearchListItem = (props: GroupItem) => {
  return (
    <div className="user-item">
      <div
        className="avatar"
        style={{
          backgroundImage: `url(${BASE_API_URL}/chats/g/${props.groupId}/avatar)`,
        }}
      ></div>
      <div className="user-item__middle-section">
        <span className="name">{props.groupName}</span>
        <span>Власник: {props.creator.name}</span>
        <span>{props.isPrivate ? "Приватна" : "Публічна"}</span>
        <span className="position">{props.membersNumber} учасників</span>
      </div>
      <div className="user-item__end-section">
        {props.joinGroupFn ? (
          <a onClick={() => props.joinGroupFn?.(props.groupId)}>Приєднатися</a>
        ) : (
          <Link to={`/chats/g/${props.groupId}`}>Відкрити чат</Link>
        )}

        <Link to={`/chats/g/${props.groupId}`} className="secondary">
          Профіль
        </Link>
      </div>
    </div>
  );
};

export default GroupSearchListItem;
