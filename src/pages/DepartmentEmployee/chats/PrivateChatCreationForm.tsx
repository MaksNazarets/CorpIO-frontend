import { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../context/AuthContext";
import { useMessengerContext } from "../../../context/MessengerContext";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { User } from "../../../types";
import { axiosInstance } from "../../../untils";
import { SearchInput } from "../components/SearchInput";
import UserSearchListItem from "./components/UserSearchListItem";

type UserItem = {
  userId: number;
  userName: string;
  userUsername: string;
  department: string;
  position: string;
  chatId?: number;
};

const PrivateChatCreationForm = () => {
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const { chats } = useMessengerContext();
  const nav = useNavigate();

  useEffect(() => {
    setUserItems([]);
  }, [searchTerm]);

  const { isLoading } = useQuery({
    queryKey: ["search-users", [searchTerm]],
    queryFn: () =>
      axiosInstance.get(`/users/get-users?likeStr=${searchTerm}&fullInfo=true`),
    onSuccess(res) {
      setUserItems(
        res.data?.users
          ?.filter((u: User) => u.id !== (user as User).id)
          .map((u: any) => {
            const existingChat = chats?.privateChats.find((c) =>
              [c.user1?.id, c.user2?.id].includes(u.id)
            );

            return {
              userId: u.id,
              userName: `${u.lastName} ${u.firstName} ${u.patronymic}`,
              userUsername: u.username,
              department: u.department.name,
              position: u.position,
              chatId: existingChat?.id,
            };
          })
      );
    },
    enabled: searchTerm.trim().length > 0,
  });

  const { mutate: startNewChat } = useMutation({
    mutationKey: ["start-p-chat"],
    mutationFn: (user2Id: number) =>
      axiosInstance.post("/chats/create-p-chat", { u2Id: user2Id }),
    onSuccess(res) {
      const chatId = res.data?.chat?.id;

      nav("/chats/p/" + chatId);
      console.log(`Private chat (id: ${chatId}) successfully created`);
    },

    onError(res) {
      console.log(res);
    },
  });

  return (
    <div className="add-chat-window">
      <h1 className="window-title">Пошук користувача</h1>
      <SearchInput
        placeholder="ПІБ або ім'я користувача"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="user-list">
        {isLoading && <LoadingSpinner top />}
        {(userItems as UserItem[]).map((ui) => (
          <UserSearchListItem
            {...ui}
            key={ui.userId}
            startNewChatFn={ui.chatId ? undefined : startNewChat}
          />
        ))}
        {userItems.length === 0 && !isLoading && (
          <span className="nothing-found-text">Нікого не знайдено...</span>
        )}
      </div>
    </div>
  );
};

export default PrivateChatCreationForm;
