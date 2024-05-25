import { Link } from "react-router-dom";
import { ChannelIcon } from "../../../assets/icon_components/ChannelIcon";
import { GroupIcon } from "../../../assets/icon_components/GroupIcon";
import { BASE_API_URL } from "../../../untils";

type Props = {
  chatId: number;
  userId?: number;
  isUserOnline?: boolean;
  chatType: "p" | "g" | "c";
  chatName: string;
  lastMsg?: {
    fromName?: string | null;
    type: "text" | "file" | "img" | "video";
    text: string | null;
  };
  unreadMsgsNumber: number;
  hideUnreadNumber?: boolean;
};

export const ChatListItem = (props: Props) => {
  const avatarUrl =
    props.chatType === "p"
      ? `${BASE_API_URL}/users/${props.userId}/avatar`
      : `${BASE_API_URL}/chats/${props.chatType}/${props.chatId}/avatar`;

  return (
    <Link
      to={`/chats/${props.chatType[0]}/${props.chatId}`}
      className="chat-item"
    >
      <div
        className={`chat-img ${props?.isUserOnline ? "user-online" : ""}`}
        style={{ backgroundImage: `url("${avatarUrl}")` }}
      >
        {props.chatType !== "p" && (
          <div className="chat-type-icon">
            {props.chatType === "c" ? <ChannelIcon /> : <GroupIcon />}
          </div>
        )}
      </div>
      <div className="chat-item-middle">
        <span className="chat-item-title">{props.chatName}</span>
      </div>
      {!props.hideUnreadNumber && (
        <div className="chat-item-unreads">{props.unreadMsgsNumber}</div>
      )}
    </Link>
  );
};
