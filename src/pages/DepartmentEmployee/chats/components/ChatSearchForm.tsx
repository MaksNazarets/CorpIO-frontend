import { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../../context/AuthContext";
import { LoadingSpinner } from "../../../../shared/components/LoadingSpinner";
import { User } from "../../../../types";
import { axiosInstance } from "../../../../untils";
import { SearchInput } from "../../components/SearchInput";
import GroupSearchListItem from "./GroupSearchListItem";
import { useMessengerContext } from "../../../../context/MessengerContext";
import ChannelSearchListItem from "./ChannelSearchListItem";

export type GroupItem = {
  groupId: number;
  groupName: string;
  creator: {
    id: number;
    name: string;
  };
  isPrivate: boolean;
  membersNumber: number;
  joinGroupFn?: (groupId: number) => void;
};

export type ChannelItem = {
  channelId: number;
  channelName: string;
  creator: {
    id: number;
    name: string;
  };
  subscribersNumber: number;
  subscribeChannelFn?: (channelId: number) => void;
};

type Props = {
  chatType: "g" | "c";
};

const ChatSearchForm = ({ chatType }: Props) => {
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [chatItems, setChatItems] = useState<GroupItem[] | ChannelItem[]>([]);
  const { chats } = useMessengerContext();

  const nav = useNavigate();

  useEffect(() => {
    setChatItems([]);
  }, [searchTerm]);

  const { mutate: joinChat } = useMutation({
    mutationKey: ["join-chat"],
    mutationFn: (chatId: number) =>
      chatType === "g"
        ? axiosInstance.post("/chats/join-group", { groupId: chatId })
        : axiosInstance.post("/chats/subscribe-channel", { channelId: chatId }),
    onSuccess(res) {
      const chatId = chatType === "g" ? res.data?.groupId : res.data?.channelId;

      chatType === "g" ? nav("/chats/g/" + chatId) : nav("/chats/c/" + chatId);

      console.log(
        `You successfully ${
          chatType === "g" ? "joined the group" : "subscribed the channel"
        } (id: ${chatId})`
      );
    },

    onError(res) {
      console.error(
        `Error ${
          chatType === "g" ? "joining the group" : "subscribing the channel"
        }:`,
        res
      );
    },
  });

  const { isLoading } = useQuery({
    queryKey: ["search-chats", [searchTerm]],
    queryFn: () =>
      chatType === "g"
        ? axiosInstance.get(
            `/chats/get-groups?likeStr=${searchTerm}&fullInfo=true`
          )
        : axiosInstance.get(
            `/chats/get-channels?likeStr=${searchTerm}&fullInfo=true`
          ),
    onSuccess(res) {
      const data = res?.data;
      chatType === "g"
        ? console.log("groups:", data.groups)
        : console.log("channels:", data.channels);

      if (!data) return;

      let filteredChats: GroupItem[] | ChannelItem[] =
        chatType === "g"
          ? res.data?.groups?.filter(
              (g: GroupItem) => g.creator.id !== (user as User).id
            )
          : res.data?.channels?.filter(
              (c: ChannelItem) => c.creator.id !== (user as User).id
            );

      const finalChannelList = filteredChats.map((c) => {
        const isMember =
          chatType === "g"
            ? chats?.groups.some((g) => g.id === (c as GroupItem).groupId)
            : chats?.channels.some(
                (ch) => ch.id === (c as ChannelItem).channelId
              );

        return chatType === "g"
          ? {
              ...(c as GroupItem),
              joinGroupFn: isMember ? undefined : joinChat,
            }
          : {
              ...(c as ChannelItem),
              subscribeChannelFn: isMember ? undefined : joinChat,
            };
      });

      setChatItems(finalChannelList as GroupItem[] | ChannelItem[]);
    },
    enabled: searchTerm.trim().length > 0,
  });

  return (
    <>
      <SearchInput
        placeholder={`Назва ${chatType === "g" ? "групи" : "каналу"}`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="user-list">
        {isLoading && <LoadingSpinner top />}
        {chatType === "g"
          ? (chatItems as GroupItem[]).map((gi) => (
              <GroupSearchListItem {...gi} key={gi.groupId} />
            ))
          : (chatItems as ChannelItem[]).map((ci) => (
              <ChannelSearchListItem {...ci} key={ci.channelId} />
            ))}
        {chatItems.length === 0 && !isLoading && (
          <span className="nothing-found-text">Нічого не знайдено...</span>
        )}
      </div>
    </>
  );
};

export default ChatSearchForm;
