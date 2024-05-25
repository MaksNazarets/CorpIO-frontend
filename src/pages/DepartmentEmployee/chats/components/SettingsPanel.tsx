import { animated, easings, useSpring } from "@react-spring/web";
import { AxiosError } from "axios";
import { useRef, useState } from "react";
import InputMask from "react-input-mask";
import { useMutation } from "react-query";
import { ChangePhotoIcon } from "../../../../assets/icon_components/ChangePhotoIcon";
import { useAuthContext } from "../../../../context/AuthContext";
import { BASE_API_URL, axiosInstance } from "../../../../untils";
import { LoadingSpinner } from "../../../../shared/components/LoadingSpinner";

type RowProps = {
  rowName: string;
  rowValue: string;
  setValue?: (val: string) => void;
  type?: "text" | "email" | "phone-number";
  invalid?: boolean;
};

const InfoRow = ({
  rowName,
  rowValue,
  setValue,
  type = "text",
  invalid = false,
}: RowProps) => {
  return (
    <div className="user-info-row">
      <div className="user-info-row-name">{rowName}</div>
      {setValue ? (
        type === "text" ? (
          <input
            type="text"
            className={
              "user-info-row-value editable" + (invalid ? " invalid" : "")
            }
            value={rowValue}
            onChange={(e) => setValue(e.target.value)}
          />
        ) : type === "email" ? (
          <input
            type="email"
            className={
              "user-info-row-value editable" + (invalid ? " invalid" : "")
            }
            value={rowValue}
            onChange={(e) => setValue(e.target.value)}
          />
        ) : type === "phone-number" ? (
          <InputMask
            mask="+38 (999) 999-99-99"
            maskChar="_"
            className={
              "user-info-row-value editable" + (invalid ? " invalid" : "")
            }
            value={rowValue}
            onChange={(e) => setValue(e.target.value.replace(/[-() _]/g, ""))}
          />
        ) : (
          ""
        )
      ) : (
        <div className="user-info-row-value">{rowValue}</div>
      )}
    </div>
  );
};

type SettingsProps = {
  closeFn: () => void;
};

function SettingsPanel({ closeFn }: SettingsProps) {
  const springs = useSpring({
    from: {
      opacity: 0,
      transform: "translateY(10px)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0)",
    },
    config: { duration: 200, easing: easings.easeOutSine },
  });

  const { user } = useAuthContext();
  if (!user || user === "unfetched") return;
  const [isLargeAvatar, setIsLargeAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarInputExists, setAvatarInputExists] = useState(true);
  const [avatarRelevance, setAvatarRelevance] = useState(new Date().getTime());

  const [newUsername, setNewUsername] = useState(user.username);
  const [newEmail, setNewEmail] = useState(user.email || "");
  const [newPhoneNumber, setNewPhoneNumber] = useState(user.phoneNumber || "");
  const [updateErrors, setUpdateErrors] = useState<{
    errorMessages: string[];
    errorTypes: string[];
  }>({
    errorMessages: [],
    errorTypes: [],
  });

  const { mutate: updateData, isLoading: isUpdatingData } = useMutation({
    mutationKey: ["update-user-personal-data"],
    mutationFn: () =>
      axiosInstance.post("users/update-user-personal-data", {
        username:
          newUsername.trim() !== user.username ? newUsername : undefined,
        phoneNumber:
          newPhoneNumber !== user.phoneNumber ? newPhoneNumber : undefined,
        email: newEmail?.trim() !== user.email ? newEmail : undefined,
      }),
    onSuccess() {
      console.log("Successfully updated user data");
      setUpdateErrors({
        errorMessages: [],
        errorTypes: [],
      });
    },
    onError(err: AxiosError) {
      console.error("Error while updating user data:", err);
      const data = err.response?.data as any;
      if (data)
        setUpdateErrors({
          errorMessages: data.errorMessages || [],
          errorTypes: data.errorTypes || [],
        });
    },
    retry: false,
  });

  const { mutate: changeAvatar } = useMutation({
    mutationKey: ["change-avatar"],
    mutationFn: () => {
      const formData = new FormData();
      formData.append(
        "avatar",
        avatarInputRef.current?.files ? avatarInputRef.current.files[0] : ""
      );
      console.log(
        avatarInputRef.current?.files ? avatarInputRef.current.files[0] : ""
      );

      return axiosInstance.post(`users/change-avatar`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    },

    onSuccess: () => {
      console.log("Successful avatar change");
      setAvatarRelevance(new Date().getTime());
    },
    onError: (err) => {
      console.error("Error while avatar change:", err);
      alert(err);
    },
    onSettled: () => {
      resetFileInput();
    },
  });

  const dataChanged = () =>
    newUsername !== user.username ||
    newEmail !== user.email ||
    newPhoneNumber !== user.phoneNumber;

  const resetFileInput = () => {
    setTimeout(() => {
      setAvatarInputExists(true);
    }, 1);
  };

  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (!event.target?.files?.[0]) return;

    const file = event.target.files[0];
    if (file.size > 10 * 1024 * 1024) {
      alert("Завеликий файл. Максимальний розмір файлу - 10MB.");
      resetFileInput();

      return;
    }

    changeAvatar();
  };

  return (
    <animated.div className="settings-panel" style={springs}>
      <div className="settings__back-btn" onClick={() => closeFn()}>
        &#129120;
      </div>
      <div className="profile-viewer__top">
        <div
          className={`profile-viewer__profile-photo ${
            isLargeAvatar ? "large-avatar" : ""
          }`}
        >
          <div
            className="change-avatar-btn"
            onClick={() => avatarInputRef.current?.click()}
          >
            <ChangePhotoIcon />
          </div>
          {avatarInputExists && (
            <>
              <div
                className="backdrop"
                style={{
                  backgroundImage: `url('${BASE_API_URL}/users/${user.id}/avatar?ts=${avatarRelevance}')`,
                }}
                onClick={() => setIsLargeAvatar((prev) => !prev)}
              ></div>
              <input
                ref={avatarInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                id="avatar-file-input"
                onChange={handleAvatarChange}
              />
            </>
          )}
        </div>
        <span className="profile-viewer__user-name">
          {user.lastName} {user.firstName} {user.patronymic || ""}
        </span>
      </div>
      <div className="profile-viewer__user-info">
        <InfoRow
          rowName="Псевдонім"
          rowValue={newUsername}
          setValue={setNewUsername}
          invalid={updateErrors.errorTypes.some((t) => t === "username")}
        />
        <InfoRow rowName="Відділ" rowValue={user.department?.name || "-"} />
        <InfoRow rowName="Посада" rowValue={user.position || "-"} />
        <InfoRow
          rowName="Ел. пошта"
          rowValue={newEmail}
          setValue={setNewEmail}
          type="email"
          invalid={updateErrors.errorTypes.some((t) => t === "email")}
        />
        <InfoRow
          rowName="Номер телефону"
          rowValue={newPhoneNumber}
          setValue={setNewPhoneNumber}
          type="phone-number"
          invalid={updateErrors.errorTypes.some((t) => t === "phoneNumber")}
        />
        {updateErrors.errorMessages.length > 0 && (
          <div className="errors-container">
            {updateErrors.errorMessages.map((e) => (
              <div className="error">{e}</div>
            ))}
          </div>
        )}
      </div>

      {isUpdatingData ? (
        <div>
          <LoadingSpinner size={1} />
        </div>
      ) : (
        dataChanged() && (
          <animated.div
            className={`profile-viewer__btn animated ${
              !dataChanged() ? "disabled" : ""
            }`}
            onClick={() => updateData()}
          >
            Зберегти зміни
          </animated.div>
        )
      )}
    </animated.div>
  );
}

export default SettingsPanel;
