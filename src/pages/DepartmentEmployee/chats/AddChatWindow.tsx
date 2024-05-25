import { useState } from "react";
import ChatSearchForm from "./components/ChatSearchForm";
import GroupCreationForm from "./components/GroupCreationForm";
import ChannelCreationForm from "./components/ChannelCreationForm";

type Props = {
  chatType: "g" | "c";
};

const AddChatWindow = ({ chatType }: Props) => {
  const [selectedTab, setSelectedTab] = useState<"find" | "create">("find");

  return (
    <div className="add-chat-window">
      <ul className="window-tab-container">
        <li
          onClick={() => setSelectedTab("find")}
          className={selectedTab === "find" ? "open" : ""}
        >
          Знайти
        </li>
        <li
          onClick={() => setSelectedTab("create")}
          className={selectedTab === "create" ? "open" : ""}
        >
          Створити
        </li>
      </ul>
      {selectedTab === "find" ? (
        <ChatSearchForm chatType={chatType} />
      ) : chatType === "g" ? (
        <GroupCreationForm />
      ) : (
        <ChannelCreationForm />
      )}
    </div>
  );
};

export default AddChatWindow;
