import { AxiosError } from "axios";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingSpinner } from "../shared/components/LoadingSpinner";
import { ChatMessage, User } from "../types";
import { axiosInstance } from "../untils";
import { useAuthContext } from "./AuthContext";

interface ChatContextProps {
  chatData: { [key: string]: any } | null;
  messages: ChatMessage[];
  isMessagesLoading: boolean;
  hasMoreMessages: boolean;
  loadMoreMessages: () => void;
}
export const ChatContext = createContext<ChatContextProps | null>(null);

export const useChatContext = (): ChatContextProps => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const { chatType, chatId } = useParams();
  const navigate = useNavigate();
  const { user, handleUnauthorized } = useAuthContext();

  if (
    !(chatId && chatType) ||
    !["p", "g", "c"].includes(chatType) ||
    isNaN(Number(chatId))
  ) {
    navigate(-1);
  }

  const [chatData, setChatData] = useState<{ [key: string]: any } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  useEffect(() => {
    if (!chatData) return;

    const prevTitle = document.title;

    document.title =
      chatType === "p"
        ? `${chatData?.firstName} ${chatData?.lastName} - приватні повідомлення`
        : chatData?.name;

    return () => {
      document.title = prevTitle;
      setMessages([]);
      setHasMoreMessages(true);
    };
  }, [chatData]);

  useEffect(() => {
    setMessages([]);
  }, [chatType, chatId]);

  useQuery({
    queryKey: ["chatData", [chatType, chatId]],
    queryFn: () => {
      return axiosInstance.get(`chats/${chatType}/${chatId}/get-chat-data`);
    },
    onSuccess: (res) => {
      setChatData(res.data);
    },
    onError(err) {
      console.log(err);
    },
    retry: (failureCount, err: AxiosError) => {
      handleUnauthorized(err);
      if (err.response?.status === 403) {
        console.error("access to chat denied");
        return false;
      }
      if (err.response?.status === 404 || failureCount > 5) return false;

      return true;
    },
  });

  const { isLoading: isMessagesLoading } = useQuery({
    queryKey: ["chatMessages", [chatType, chatId]],
    queryFn: () =>
      axiosInstance.get(`chats/${chatType}/${chatId}/get-chat-messages`),
    onSuccess: (res) => {
      console.log("received msgs:", res.data.messages);
      setMessages(res.data.messages);
    },
    onError(err: any) {
      console.error(err);
    },
    retry: (failureCount, err: AxiosError) => {
      handleUnauthorized(err);

      if (err.response?.status === 403) {
        console.error("Access to chat denied");
        return false;
      }
      if (err.response?.status === 404 || failureCount > 5) return false;
      return true;
    },
    enabled: messages.length === 0,
    cacheTime: 0,
  });

  const { refetch: requestMoreMessages } = useQuery({
    queryKey: ["newLoadedMessages"],
    queryFn: () =>
      axiosInstance.get(
        `chats/${chatType}/${chatId}/get-chat-messages?startMsgId=${
          messages[messages.length - 1]?.id
        }`
      ),
    onSuccess: (res) => {
      const newMsgs = res.data.messages;
      setMessages((curr) => [...curr, ...newMsgs]);

      if (newMsgs.length === 0) setHasMoreMessages(false);

      console.log(
        "successfully loaded " + res.data?.messages?.length + " more messages"
      );
    },
    onError(err: AxiosError) {
      if (err.response?.status !== 404) console.error(err);
    },
    retry: (failureCount, err: AxiosError) => {
      if (err.response?.status === 403) {
        console.error("access to chat denied");
        return false;
      }
      if (err.response?.status === 404) {
        console.error("chat not found :(");

        return false;
      }
      if (failureCount > 5) {
        return false;
      }
      return true;
    },
    enabled: false,
  });

  const { socket } = useAuthContext();

  const processReceivedMessage = (
    msg: ChatMessage & { groupId?: number; channelId?: number }
  ) => {
    console.log("message-received:", msg);
    console.log("chat data:", chatData);

    if (
      msg.chat.id === chatData?.baseChat?.id ||
      (chatType === "g" && msg.groupId === chatData?.id) ||
      (chatType === "c" && msg.channelId === chatData?.id)
    ) {
      setMessages((curr) => [msg, ...curr]);

      if (msg.sender.id !== (user as User).id) {
        markMsgsAsSeen();
      }
    }
  };

  const updateMessages = () => {
    socket!.emit(
      "get new messages",
      { chatId, chatType, lastMessageId: messages[0]?.id },
      (messages: ChatMessage[]) => {
        console.log("new messages:", messages);
      }
    );
  };

  const markMsgsAsSeen = () => {
    if (chatType !== "p") return;

    socket?.emit("mark all msgs as seen", Number(chatId));
    setMessages((curr) => {
      return curr.map((msg) => {
        if (msg.sender.id !== (user as User).id && !msg.isSeen)
          return { ...msg, isSeen: true };
        else return msg;
      });
    });
  };

  useEffect(() => {
    if (socket) {
      markMsgsAsSeen();
      socket.on("connect", updateMessages);
      chatType === "p" && socket.on("private-message", processReceivedMessage);
      chatType === "g" && socket.on("group-message", processReceivedMessage);
      chatType === "c" && socket.on("channel-post", processReceivedMessage);

      socket.on("messages seen", (id: number) => {
        console.log("messages seen in chat", id);
        if (id === Number(chatId))
          setMessages((curr) => {
            return curr.map((msg) => {
              if (msg.sender.id === (user as User).id && !msg.isSeen)
                return { ...msg, isSeen: true };
              else return msg;
            });
          });
      });

      chatType === "g" &&
        socket.on("new group member", (data) => {
          console.log("new group member", data);
          if (data.groupId === Number(chatId))
            setChatData((prev) => ({
              ...prev,
              members_number: prev?.members_number + 1,
            }));
        });

      chatType === "g" &&
        socket.on("group member removed", (data) => {
          console.log("group member removed", data);
          if (data.groupId === Number(chatId))
            setChatData((prev) => ({
              ...prev,
              members_number: prev?.members_number - 1,
            }));
        });

      return () => {
        socket.off("connect", updateMessages);
        socket.off("messages seen");
        chatType === "p" &&
          socket.off("private-message", processReceivedMessage);
        chatType === "g" && socket.off("group-message", processReceivedMessage);
        chatType === "g" && socket.off("new group member");
        chatType === "g" && socket.off("group member removed");
        chatType === "c" && socket.off("channel-post", processReceivedMessage);
      };
    }
  }, [socket, chatData]);

  return (
    <ChatContext.Provider
      value={{
        chatData,
        messages,
        isMessagesLoading,
        loadMoreMessages: requestMoreMessages,
        hasMoreMessages,
      }}
    >
      {chatData ? children : <LoadingSpinner size={2} />}
    </ChatContext.Provider>
  );
};
