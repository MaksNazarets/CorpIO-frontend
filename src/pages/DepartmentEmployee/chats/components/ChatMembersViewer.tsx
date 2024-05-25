import { animated, easings, useSpring } from "@react-spring/web";
import { AxiosError } from "axios";
import { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useAuthContext } from "../../../../context/AuthContext";
import { useModalWindowsContext } from "../../../../context/ModalWindowsContext";
import { LoadingSpinner } from "../../../../shared/components/LoadingSpinner";
import { User } from "../../../../types";
import { BASE_API_URL, axiosInstance } from "../../../../untils";
import { SearchInput } from "../../components/SearchInput";

type ViewerProps = {
  groupId: number;
  closeFn: () => void;
};

const GroupMember = ({
  user,
  onClick,
  removable,
  removeFn,
}: {
  user: User;
  onClick?: () => void;
  removable?: boolean;
  removeFn?: () => void;
}) => {
  const { user: me } = useAuthContext();
  return (
    <div className={`project-user`}>
      <div
        className="project-user-avatar"
        style={{
          backgroundImage: `url('${BASE_API_URL}/users/${user.id}/avatar')`,
        }}
        onClick={() => onClick?.()}
      ></div>
      <div className="project-user-info" onClick={() => onClick?.()}>
        <div className="project-user-name">
          {user.lastName} {user.firstName} {user.patronymic ?? user.patronymic}{" "}
          {(me as User).id === user.id && "(Ви)"}
        </div>
        <div className="project-user-position">{user.department?.name}</div>
      </div>
      {removable && (
        <div
          className="project-user-checkmark minus"
          onClick={() => removeFn?.()}
        >
          <div onClick={() => {}}></div>
        </div>
      )}
    </div>
  );
};

const ChatMemberViewer = ({ groupId, closeFn }: ViewerProps) => {
  const { user: me } = useAuthContext();
  const { setProfileViewerUserId } = useModalWindowsContext();
  const [members, setMembers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState<string>("");
  const [isAddMemberFormOpen, setIsAddMemberFormOpen] = useState(false);
  const [adminUserId, setAdminUserId] = useState<number | null>(null);

  const { isLoading: isMembersLoading, isError: isMembersLoadingError } =
    useQuery({
      queryKey: ["get-group-members-" + groupId],
      queryFn: () =>
        axiosInstance.get("/chats/get-group-members?gid=" + groupId),
      onError: (err) => {
        console.error("Couldn't find the group members :(", err);
        alert("При отриманні списку учасників групи сталася помилка");
      },
      onSuccess: (res) => {
        console.log("Members of the group chat found: ", res.data);
        setMembers(res.data.members);
        setAdminUserId(res.data.creatorId);
      },
      retry(failureCount, error: AxiosError) {
        if (failureCount > 1 || error.status === 404 || error.status === 400) {
          closeFn();
          return false;
        }

        return true;
      },
    });

  const { isLoading: isSearchUsersLoading } = useQuery({
    queryKey: ["searh-users", [userSearchTerm]],
    queryFn: () =>
      axiosInstance.get(
        `/users/get-users?likeStr=${userSearchTerm}&fullInfo=true`
      ),
    onSuccess(res) {
      console.log("Users found: ", res.data);
      setFilteredUsers(
        res.data.users.filter(
          (u: User) => !members.map((m) => m.id).includes(u.id)
        )
      );
    },
    onError: (err) => {
      setFilteredUsers([]);
      console.error("Couldn't find the users for this term:", err);
    },

    retry(failureCount, error: AxiosError) {
      if (failureCount > 1 || error.status === 404 || error.status === 400)
        return false;

      return true;
    },
    enabled: userSearchTerm.trim().length > 0,
  });

  const { mutate: addMember } = useMutation({
    mutationKey: ["add-group-member"],
    mutationFn: (userId: number) =>
      axiosInstance.post("/chats/add-group-member", {
        groupId: groupId,
        userId: userId,
      }),
    onSuccess(res) {
      setIsAddMemberFormOpen(false);
      setUserSearchTerm("");
      setMembers((prev) => [...prev, res.data.newMember]);
    },

    onError(err) {
      console.error("Couldn't add user to the group:", err);
    },
  });

  const { mutate: removeMember } = useMutation({
    mutationKey: ["remove-group-member"],
    mutationFn: (userId: number) =>
      axiosInstance.put("/chats/remove-group-member", {
        groupId: groupId,
        userId: userId,
      }),
    onSuccess(res) {
      setMembers((prev) => prev.filter((m) => m.id !== res.data.userId));
    },

    onError(err) {
      console.error("Couldn't remove user from the group:", err);
    },
  });

  const backdropSprings =
    members.length === 0
      ? useSpring({})
      : useSpring({
          from: {
            opacity: 0,
            backdropFilter: "blur(0px)",
          },
          to: {
            opacity: 1,
            backdropFilter: "blur(5px)",
          },
          config: { duration: 200, easing: easings.easeOutSine },
        });

  const windowSprings =
    members.length === 0
      ? useSpring({})
      : useSpring({
          from: {
            transform: "translateY(5px)",
          },
          to: {
            transform: "translateY(0)",
          },
          config: { duration: 200, easing: easings.easeOutSine },
        });

  if (!isMembersLoading && isMembersLoadingError) return;
  if (isMembersLoading) return;
  if (members.length === 0) return;

  return (
    <animated.div className="modal-window" style={backdropSprings}>
      <animated.div
        className={`group-members-wrapper  ${
          isAddMemberFormOpen ? "add-member-mode" : ""
        }`}
        style={windowSprings}
      >
        <h2>{isAddMemberFormOpen ? "Додавання учасника" : "Учасники"}</h2>
        {isAddMemberFormOpen && (
          <SearchInput
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
            placeholder="ПІБ або псевдонім користувача..."
            style={{ margin: "0 2px" }}
          />
        )}
        <div className="group-members-list">
          {!isAddMemberFormOpen &&
            members.map((m) => (
              <GroupMember
                user={m}
                key={m.id}
                onClick={() => {
                  if ((me as User).id !== m.id) {
                    closeFn();
                    setProfileViewerUserId(m.id);
                  }
                }}
                removable={adminUserId === (me as User).id}
                removeFn={() => removeMember(m.id)}
              />
            ))}
          {isAddMemberFormOpen && (
            <>
              {filteredUsers.map((m) => (
                <GroupMember
                  user={m}
                  key={m.id}
                  onClick={() => addMember(m.id)}
                />
              ))}
              {!isSearchUsersLoading && filteredUsers.length === 0 && (
                <span className="no-list-items-label">
                  Нікого не знайдено...
                </span>
              )}
            </>
          )}
          {isAddMemberFormOpen && isSearchUsersLoading && (
            <LoadingSpinner top />
          )}
        </div>
        {!isAddMemberFormOpen ? (
          adminUserId === (me as User).id && (
            <div
              className="profile-viewer__btn"
              onClick={() => setIsAddMemberFormOpen(true)}
            >
              Додати учасника
            </div>
          )
        ) : (
          <div
            className="add-group-member-cancel-btn"
            onClick={() => setIsAddMemberFormOpen(false)}
          >
            Скасувати
          </div>
        )}
      </animated.div>
      <div className="backdrop" onClick={() => closeFn()}></div>
    </animated.div>
  );
};

export default ChatMemberViewer;
