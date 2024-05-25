import { useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { FormCheckbox } from "../../../../shared/components/FormCheckbox";
import { FormInput } from "../../../../shared/components/FormInput";
import { FormTextArea } from "../../../../shared/components/FormTextArea";
import { axiosInstance } from "../../../../untils";

type GroupData = {
  name: string;
  description: string;
  isPrivate: boolean;
};

type CreationErrors = {
  errorTypes: string[];
  errorMessages: string[];
};

const GroupCreationForm = () => {
  const [newGroupData, setNewGroupData] = useState<GroupData>({
    name: "",
    description: "",
    isPrivate: false,
  });
  const [errors, setErrors] = useState<CreationErrors | null>(null);

  const nav = useNavigate();

  const { mutate: createGroup } = useMutation({
    mutationKey: ["create-group"],
    mutationFn: (groupData: GroupData) =>
      axiosInstance.post("/chats/create-group", { data: groupData }),
    onSuccess(res) {
      const chatId = res.data?.chat?.id;

      nav("/chats/g/" + chatId);
      console.log(`Group (id: ${chatId}) successfully created`);
    },

    onError(err: any) {
      if (err.response.status === 400) {
        setErrors(err.response.data);
      }
    },
  });

  const submit = (e: any) => {
    e.preventDefault();
    createGroup(newGroupData);
  };

  return (
    <form onSubmit={submit}>
      <FormInput
        id="group-name-input"
        name="name"
        label="Назва групи"
        value={newGroupData.name}
        onChange={(e) =>
          setNewGroupData((prev) => ({ ...prev, name: e.target.value }))
        }
        className={
          errors && errors.errorTypes?.includes("name") ? "invalid" : ""
        }
        required
      />

      <FormTextArea
        id="group-description-input"
        name="description"
        label="Опис"
        value={newGroupData.description}
        onChange={(e) =>
          setNewGroupData((prev) => ({
            ...prev,
            description: e.target.value,
          }))
        }
      />

      <FormCheckbox
        id="is-group-private-cb"
        name="isPrivate"
        label="Приватна"
        checked={newGroupData.isPrivate}
        onChange={() =>
          setNewGroupData((prev) => ({ ...prev, isPrivate: !prev.isPrivate }))
        }
      />

      {errors && (
        <div className="error-msg-container">
          {errors?.errorMessages?.map((m) => (
            <span className="error-message" key={m}>{m}</span>
          ))}
        </div>
      )}

      <button type="submit" className="big-button submit-btn">
        Створити
      </button>
    </form>
  );
};
export default GroupCreationForm;
