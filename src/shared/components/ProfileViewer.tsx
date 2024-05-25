import { animated, easings, useSpring } from "@react-spring/web";
import { AxiosError } from "axios";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import {
  BASE_API_URL,
  axiosInstance,
  formatInternationalPhoneNumber,
  getLastOnlineDateTime,
} from "../../untils";
import { useState } from "react";

type ViewerProps = {
  userId: number;
  closeFn: () => void;
};

type RowProps = {
  rowName: string;
  rowValue: string;
};

const InfoRow = ({ rowName, rowValue }: RowProps) => {
  return (
    <div className="user-info-row">
      <div className="user-info-row-name">{rowName}</div>
      <div className="user-info-row-value">{rowValue}</div>
    </div>
  );
};

const ProfileViewer = ({ userId, closeFn }: ViewerProps) => {
  const [isLargeAvatar, setIsLargeAvatar] = useState(false);
  const nav = useNavigate();

  const { mutate: startNewChat } = useMutation({
    mutationKey: ["start-p-chat"],
    mutationFn: () =>
      axiosInstance.post("/chats/create-p-chat", { u2Id: userId }),

    onSuccess(res) {
      const chatId = res.data?.chat?.id;

      nav("/chats/p/" + chatId);
      console.log(`Private chat (id: ${chatId}) successfully created`);
    },

    onError() {
      alert("При створенні чату виникла помилка :(");
    },
  });

  const {
    data: userDataResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["get-user-data-" + userId],
    queryFn: () => axiosInstance.get("/users/get-user-data?userId=" + userId),
    onError: (err) => {
      console.error("Couldn't get use data:", err);
      alert("При отриманні даних користувача сталася помилка");
    },

    retry(failureCount, error: AxiosError) {
      if (failureCount > 1 || error.status === 404 || error.status === 400) {
        closeFn();
        return false;
      }

      return true;
    },
  });

  const backdropSprings = isLoading
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

  const windowSprings = isLoading
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

  const goToChat = () => {
    closeFn();

    userDataResponse?.data.chatId
      ? nav("/chats/p/" + userDataResponse?.data.chatId)
      : startNewChat();
  };

  if (!isLoading && isError) return;
  if (isLoading) return;

  return (
    <animated.div className="profile-viewer" style={backdropSprings}>
      <animated.div className="user-info-wrapper" style={windowSprings}>
        <div className="profile-viewer__top">
          <div
            style={{
              backgroundImage: `url("${BASE_API_URL}/users/${userId}/avatar")`,
            }}
            className={`profile-viewer__profile-photo ${
              isLargeAvatar ? "large-avatar" : ""
            }`}
            onClick={() => setIsLargeAvatar((prev) => !prev)}
          />
          <span className="profile-viewer__user-name">
            {userDataResponse?.data.lastName} {userDataResponse?.data.firstName}{" "}
            {userDataResponse?.data.patronymic || ""}
          </span>
          <span className="profile-viewer__online-status">
            {userDataResponse?.data.isOnline
              ? "Онлайн"
              : "Востаннє в мережі: " +
                getLastOnlineDateTime(userDataResponse?.data.lastTimeOnline)}
          </span>
        </div>
        <div className="profile-viewer__user-info">
          <InfoRow
            rowName="Псевдонім"
            rowValue={userDataResponse?.data.username}
          />
          <InfoRow
            rowName="Відділ"
            rowValue={userDataResponse?.data.department.name}
          />
          <InfoRow
            rowName="Посада"
            rowValue={userDataResponse?.data.position}
          />
          <InfoRow
            rowName="Ел. пошта"
            rowValue={userDataResponse?.data.email}
          />
          <InfoRow
            rowName="Номер телефону"
            rowValue={formatInternationalPhoneNumber(
              userDataResponse?.data.phoneNumber
            )}
          />
        </div>
        <div className="profile-viewer__btn" onClick={() => goToChat()}>
          Надіслати повідомлення
        </div>
      </animated.div>
      {/* )} */}
      <div className="backdrop" onClick={() => closeFn()}></div>
    </animated.div>
  );
};

export default ProfileViewer;
