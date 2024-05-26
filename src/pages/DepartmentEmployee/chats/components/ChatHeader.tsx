import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ChannelIcon } from "../../../../assets/icon_components/ChannelIcon";
import { GroupIcon } from "../../../../assets/icon_components/GroupIcon";
import { useModalWindowsContext } from "../../../../context/ModalWindowsContext";
import { BASE_API_URL, getLastOnlineDateTime } from "../../../../untils";

type Props = {
  chatData:
    | {
        chatId: number;
        userId?: number;
        firstName?: string;
        lastName?: string;
        name?: string;
        isOnline?: boolean;
        lastTimeOnline?: string;
        members_number?: number;
        subscribers_number?: number;
        adminIds?: [number];
      }
    | any
    | null;

  chatType: "p" | "g" | "c";
};

export const ChatHeader = ({ chatData, chatType }: Props) => {
  const { chatId } = useParams();
  // const { user } = useAuthContext();
  const [lastTimeOnline, setLastTimeOnline] = useState<string | null>(null);
  // const [isVisibleMenu, setIsVisibleMenu] = useState(true);

  const { setProfileViewerUserId, setGroupMemberViewerGroupId } =
    useModalWindowsContext();

  const avatartUrl =
    chatType === "p"
      ? `${BASE_API_URL}/users/${chatData?.userId}/avatar`
      : `${BASE_API_URL}/chats/${chatType}/${chatId}/avatar`;

  const title =
    chatType === "p"
      ? `${chatData?.firstName || ""} ${chatData?.lastName || ""}`
      : chatData?.name || "";

  useEffect(() => {
    let timeout: any = null;
    if (!chatData?.isOnline && chatData?.lastTimeOnline) {
      setLastTimeOnline(getLastOnlineDateTime(chatData.lastTimeOnline));
      console.log("lastTimeOnline set");
      timeout = setInterval(() => {
        setLastTimeOnline(getLastOnlineDateTime(chatData.lastTimeOnline));
        console.log("lastTimeOnline changed");
      }, 30000);
    }

    return () => {
      timeout && clearInterval(timeout);
      console.log("lastTimeOnline interval cleared");
    };
  }, [chatData]);

  const processHeaderClick = () => {
    chatType === "p" &&
      chatData?.userId &&
      setProfileViewerUserId(chatData?.userId);

    chatType === "g" && chatId && setGroupMemberViewerGroupId(Number(chatId));
  };

  const status =
    chatType === "p"
      ? chatData?.isOnline
        ? "в мережі"
        : `востаннє в мережі: ${lastTimeOnline || "ніколи"}`
      : null;

  return (
    <div className="chat-header">
      <div
        className={`chat-img ${chatData?.isOnline ? "user-online" : ""}`}
        style={{ backgroundImage: `url(${avatartUrl})` }}
        onClick={processHeaderClick}
      >
        {chatType !== "p" && (
          <div className="chat-type-icon">
            {chatType === "c" ? (
              <ChannelIcon />
            ) : chatType === "g" ? (
              <GroupIcon />
            ) : (
              ""
            )}
          </div>
        )}
      </div>
      <div className="chat-info" onClick={processHeaderClick}>
        <span className="chat-title">{title || "..."}</span>
        <span className="chat-user-info">
          {status ||
            (chatType === "g"
              ? chatData?.members_number
                ? chatData?.members_number + " учасник(ів)"
                : ""
              : chatData?.subscribers_number
              ? chatData?.subscribers_number + " підписник(ів)"
              : "")}
        </span>
      </div>
      {/* {chatData?.adminIds?.includes((user as User).id) && (
        <div className="chat-options">
          <span></span>
          <span></span>
          <span></span>
          {isVisibleMenu && (
            <div className="chat-menu">
              <div>Додати учасника</div>
            </div>
          )}
        </div>
      )} */}
    </div>
  );
};
