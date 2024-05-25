import { useCallback, useEffect, useState } from "react";
import { useMessengerContext } from "../../../context/MessengerContext";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { SearchInput } from "../components/SearchInput";
import { ChatListItem } from "./ChatListItem";
import { PlusIcon } from "../../../assets/icon_components/PlusIcon";
import AddChatMenu from "../components/AddChatMenu";
import { useAuthContext } from "../../../context/AuthContext";
import { User } from "../../../types";

export const ChatBar = () => {
  const { chats, chatFilters, setChatFilters, isChatsLoading } =
    useMessengerContext();
  const [selectedTypeTab, setSelectedTypeTab] = useState<"p" | "g" | "c">("p");
  const [isNewChatMenuOpen, setIsNewChatMenuOpen] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    const prevTitle = document.title;

    document.title = "Чати - CorpIO";

    return () => {
      document.title = prevTitle;
    };
  }, []);

  const matchesFilters = useCallback(
    (text: string) => {
      let pattern = new RegExp(chatFilters.text, "i");

      if (pattern.test(text)) {
        return true;
      } else {
        return false;
      }
    },
    [chatFilters]
  );

  return (
    <>
      <div className="bar-top">
        <SearchInput
          value={chatFilters.text}
          onChange={(e) =>
            setChatFilters((curr) => ({ ...curr, text: e.target.value }))
          }
          placeholder="Введіть назву чату..."
        />
        <div
          className="plus-btn"
          onClick={() => setIsNewChatMenuOpen((curr) => !curr)}
        >
          <PlusIcon />
          {isNewChatMenuOpen && <AddChatMenu />}
        </div>
      </div>

      <div className="chat-type-tab-container">
        <button
          className={selectedTypeTab === "p" ? "active" : ""}
          onClick={() => setSelectedTypeTab("p")}
        >
          Приватні
        </button>
        <button
          className={selectedTypeTab === "g" ? "active" : ""}
          onClick={() => setSelectedTypeTab("g")}
        >
          Групи
        </button>
        <button
          className={selectedTypeTab === "c" ? "active" : ""}
          onClick={() => setSelectedTypeTab("c")}
        >
          Канали
        </button>
      </div>
      <div className="chat-list">
        {selectedTypeTab === "p"
          ? chats?.privateChats.map((chat) => {
              const chatName = `${(chat.user1 || chat.user2)?.firstName} ${
                (chat.user1 || chat.user2)?.lastName
              }`;
              const chatUser = [(user as User).id, undefined].includes(
                chat.user1?.id
              )
                ? chat.user2
                : chat.user1;

              return (
                matchesFilters(chatName) && (
                  <ChatListItem
                    chatType="p"
                    chatId={chat.id}
                    chatName={chatName}
                    userId={chatUser?.id}
                    isUserOnline={chatUser?.isOnline}
                    unreadMsgsNumber={chat.unreadMsgsNumber}
                    key={chat.id}
                  />
                )
              );
            })
          : selectedTypeTab === "g"
          ? chats?.groups.map(
              (group) =>
                matchesFilters(group.name) && (
                  <ChatListItem
                    chatType="g"
                    chatId={group.id}
                    chatName={group.name}
                    unreadMsgsNumber={group.unreadMsgsNumber}
                    key={group.id}
                  />
                )
            ) || "asdasd"
          : chats?.channels.map(
              (channel) =>
                matchesFilters(channel.name) && (
                  <ChatListItem
                    chatType="c"
                    chatId={channel.id}
                    chatName={channel.name}
                    unreadMsgsNumber={channel.unreadMsgsNumber}
                    key={channel.id}
                  />
                )
            )}

        {isChatsLoading && <LoadingSpinner top />}
      </div>
    </>
  );
};
