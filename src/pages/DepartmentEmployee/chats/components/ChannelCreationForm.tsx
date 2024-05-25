import { useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { FormInput } from "../../../../shared/components/FormInput";
import { FormTextArea } from "../../../../shared/components/FormTextArea";
import { axiosInstance } from "../../../../untils";

type ChannelData = {
  name: string;
  description: string;
};

type CreationErrors = {
  errorTypes: string[];
  errorMessages: string[];
};

const ChannelCreationForm = () => {
  const [newChannelData, setNewChannelData] = useState<ChannelData>({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<CreationErrors | null>(null);

  const nav = useNavigate();

  const { mutate: createChannel } = useMutation({
    mutationKey: ["create-channel"],
    mutationFn: (channelData: ChannelData) =>
      axiosInstance.post("/chats/create-channel", { data: channelData }),
    onSuccess(res) {
      const chatId = res.data?.chat?.id;

      nav("/chats/c/" + chatId);
      console.log(`Channel (id: ${chatId}) successfully created`);
    },

    onError(err: any) {
      if (err.response.status === 400) {
        setErrors(err.response.data);
      }
    },

    retry: false,
  });

  const submit = (e: any) => {
    e.preventDefault();
    createChannel(newChannelData);
  };

  return (
    <form onSubmit={submit}>
      <FormInput
        id="channel-name-input"
        name="name"
        label="Назва каналу"
        value={newChannelData.name}
        onChange={(e) =>
          setNewChannelData((prev) => ({ ...prev, name: e.target.value }))
        }
        className={
          errors && errors.errorTypes?.includes("name") ? "invalid" : ""
        }
        required
      />

      <FormTextArea
        id="channel-description-input"
        name="description"
        label="Опис"
        value={newChannelData.description}
        onChange={(e) =>
          setNewChannelData((prev) => ({
            ...prev,
            description: e.target.value,
          }))
        }
      />

      {errors && (
        <div className="error-msg-container">
          {errors?.errorMessages?.map((m) => (
            <span className="error-message" key={m}>
              {m}
            </span>
          ))}
        </div>
      )}

      <button type="submit" className="big-button submit-btn">
        Створити
      </button>
    </form>
  );
};
export default ChannelCreationForm;
