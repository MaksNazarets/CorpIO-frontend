import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AttachFileIcon } from "../../../../assets/icon_components/AttachFileIcon";
import { PaperPlaneIcon } from "../../../../assets/icon_components/PaperPlaneIcon";
import { useAuthContext } from "../../../../context/AuthContext";
import { axiosInstance, getFilenameParts } from "../../../../untils";
import { useMutation } from "react-query";

type Props = {
  scrollToBottomFn: () => void;
};

export const MessageCreator = ({ scrollToBottomFn }: Props) => {
  const { chatId, chatType } = useParams();
  const [msgText, setMsgText] = useState("");
  const { socket } = useAuthContext();
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedFileNames, setSelectedFileNames] = useState<
    { name: string; extension: string }[]
  >([]);
  const [fileInputExists, setFileInputExists] = useState(true);
  const [msgInputHeight, setMsgInputHeight] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  if (!chatId || !chatType) return "No required url params";

  const { mutate: sendMsgWithAttachments } = useMutation({
    mutationKey: ["send-msg-with-attachments"],
    mutationFn: () => {
      const formData = new FormData();
      formData.append("text", msgText);
      formData.append("chatId", chatId);
      for (let file of selectedFiles || []) {
        formData.append("files", file);
      }

      const url =
        chatType === "p"
          ? "send-private-message-with-files"
          : chatType === "g"
          ? "send-group-message-with-files"
          : "send-channel-post-with-files";

      return axiosInstance.post(`chats/${url}`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    },

    onSuccess: () => {
      console.log("Successful sending of message");
      setMsgText("");
      resetFileInput();
    },
    onError: (err) => {
      console.error("Error while sending the message:", err);
    },
    onSettled: () => {
      setIsSendingMessage(false);
    },
  });

  const sendMessage = (e?: FormEvent) => {
    e?.preventDefault();

    if (msgText.trim().length === 0 && selectedFiles === null) return;

    setIsSendingMessage(true);

    const messageType =
      chatType === "p"
        ? "private-message"
        : chatType === "g"
        ? "group-message"
        : "channel-post";

    if (selectedFiles) {
      sendMsgWithAttachments();
    } else
      socket?.emit(
        messageType,
        {
          text: msgText,
          chatId: Number(chatId),
        },
        (res: any) => {
          console.log(res);
          setIsSendingMessage(false);
          setTimeout(() => {
            scrollToBottomFn();
          }, 100);
          setMsgText("");
          resetFileInput();
        }
      );
  };

  const resetFileInput = () => {
    setSelectedFileNames([]);
    setSelectedFiles(null);
    setFileInputExists(false);
    setTimeout(() => {
      setFileInputExists(true);
    }, 1);
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (!event.target?.files?.[0]) {
      setSelectedFiles(null);
      setSelectedFileNames([]);

      return;
    }

    if (event.target.files.length > 10) {
      alert("Максимальна к-сть файлів - 10");
      resetFileInput();

      return;
    }

    let fileNames = [];
    const files = event.target.files;
    for (let file of files) {
      if (file.size > 1024 * 1024 * 30) {
        alert("Завеликий файл. Максимальний розмір файлу - 30MB.");
        resetFileInput();

        return;
      }
      fileNames.push(getFilenameParts(file.name));
    }
    setSelectedFileNames(fileNames);
    setSelectedFiles(files);
  };

  const submit = (e: KeyboardEvent) => {
    if (isSendingMessage) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    setIsSendingMessage(false);
  }, [chatId]);

  const handleResize = () => {
    if (
      !textAreaRef.current?.scrollHeight ||
      !textAreaRef.current?.clientHeight
    )
      return;

    if (textAreaRef.current?.scrollHeight > 350) {
      textAreaRef.current.style.overflow = "auto";
      return;
    }
    textAreaRef.current.style.overflow = "hidden";

    textAreaRef.current.style.height = "auto";
    textAreaRef.current.style.height = textAreaRef.current?.scrollHeight + "px";
    setMsgInputHeight(textAreaRef.current?.scrollHeight);
  };

  useEffect(() => {
    handleResize();
  }, [msgText]);

  return (
    <form id="send-msg-form" onSubmit={sendMessage}>
      <div className="msg-input-box">
        <textarea
          ref={textAreaRef}
          rows={1}
          className="msg-input interactive"
          placeholder={chatType === "c" ? "Публікація..." : "Повідомлення..."}
          value={msgText}
          onChange={(e) => setMsgText(e.target.value)}
          onKeyDown={submit}
        ></textarea>
        <textarea rows={1} className="msg-input unvisible"></textarea>
        {/* <div className="msg-input-btns"> */}
        {/* <div className="smiles-btn">
            <SmileIcon />
          </div> */}
        <div
          className="attach-file-btn"
          onClick={() => {
            fileInputRef.current?.click();
          }}
        >
          <AttachFileIcon />
        </div>
        {/* </div> */}
        {fileInputExists && (
          <input
            ref={fileInputRef}
            type="file"
            id="attachment-file-input"
            onChange={handleFileChange}
            multiple
          />
        )}

        {selectedFiles !== null && (
          <div
            className="attach-file-window"
            style={{ bottom: `calc(${msgInputHeight + 3}px)` }}
          >
            <div className="attached-file-list">
              <div className="attached-file-item">
                <b>Вибрано</b>
              </div>
              {selectedFiles &&
                selectedFileNames.map((n) => (
                  <div
                    className="attached-file-item"
                    key={n.name + n.extension}
                  >
                    {n.name.length <= 25
                      ? n.name
                      : n.name.substring(0, 22) + "... "}
                    .{n.extension}
                  </div>
                ))}
            </div>
            <div className="attachments-btn-wrapper">
              <label
                id="attachment-file-input-label"
                htmlFor="attachment-file-input"
              >
                Змінити файли
              </label>
              <span
                className="remove-files-btn"
                onClick={() => resetFileInput()}
              >
                &#x2715;
              </span>
            </div>
            {/* <textarea
        id="attachment-description"
        onChange={(e) => setDescription(e.target.value)}
      ></textarea> */}
          </div>
        )}
      </div>
      <button className="send-btn" type="submit">
        {!isSendingMessage && <PaperPlaneIcon />}
        {isSendingMessage && "..."}
      </button>
    </form>
  );
};
