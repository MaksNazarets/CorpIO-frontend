import React, { useEffect, useRef } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { useIsFetching } from "react-query";
import { useParams } from "react-router-dom";
import { useAuthContext } from "../../../../context/AuthContext";
import { useChatContext } from "../../../../context/ChatContext";
import useIntersectionObserver from "../../../../hooks/useIntersectionObserver";
import { LoadingSpinner } from "../../../../shared/components/LoadingSpinner";
import { User } from "../../../../types";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { DateDivider } from "./DateDivider";
import { MessageCreator } from "./MessageCreator";
import ToChatBottomButton from "./ToChatBottomButton";
import { UnreadMessagesSectionDivider } from "./UnreadMessagesSectionDivider";

export const Chat = () => {
  const { chatType } = useParams();
  const {
    chatData,
    messages,
    isMessagesLoading,
    loadMoreMessages,
    hasMoreMessages,
  } = useChatContext();
  const { user } = useAuthContext();

  const isFetchingMoreMsgs = useIsFetching({ queryKey: ["newLoadedMessages"] });

  const [getMoreMsgsTriggerRef] = useInfiniteScroll({
    loading: isFetchingMoreMsgs > 0,
    hasNextPage: hasMoreMessages,
    onLoadMore: loadMoreMessages,
  });

  const lastUreadMsgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("hasMoreMessages:", hasMoreMessages);
  }, [hasMoreMessages]);

  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: "Europe/Kiev",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const isSameDate = (timestamp1: string, timestamp2: string) => {
    return (
      new Date(timestamp1).toLocaleString("uk-UA", dateOptions) ===
      new Date(timestamp2).toLocaleString("uk-UA", dateOptions)
    );
  };

  const { targetRef: chatBottomRef, isIntersecting: isChatBottomVisible } =
    useIntersectionObserver({
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    });

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="chat-box">
      <ChatHeader chatType={chatType as "p" | "g" | "c"} chatData={chatData} />
      <div className="chat-content">
        <div className="chat-wrapper message-list">
          <div ref={chatBottomRef}></div>

          {!isMessagesLoading &&
            messages?.map((msg, index) => (
              <React.Fragment key={msg.id}>
                <ChatMessage
                  message={msg}
                  myMessage={
                    chatType === "c"
                      ? false
                      : msg.sender?.id === (user as User).id
                  }
                  chatType={chatType as "p" | "g" | "c"}
                />
                {!isSameDate(msg.timestamp, messages[index + 1]?.timestamp) && (
                  <DateDivider
                    timestamp={new Date(msg.timestamp).toLocaleString(
                      "uk-UA",
                      dateOptions
                    )}
                  />
                )}

                {msg.sender?.id !== (user as User).id &&
                  !msg.isSeen &&
                  (messages[index + 1]?.isSeen || !messages[index + 1]) && (
                    <>
                      <UnreadMessagesSectionDivider />
                      <div ref={lastUreadMsgRef}></div>
                    </>
                  )}

                {messages.length - index === 3 && (
                  <div ref={getMoreMsgsTriggerRef}></div>
                )}
              </React.Fragment>
            ))}
          {isFetchingMoreMsgs > 0 && <LoadingSpinner size={1} />}
          {isMessagesLoading && <LoadingSpinner size={2} />}
          {!isMessagesLoading && messages.length === 0 && (
            <span className="no-msg-text">
              {chatType !== "c"
                ? "Ще немає повідомлень..."
                : "Ще немає публікацій..."}
            </span>
          )}
        </div>
      </div>
      <div className="msg-input-container">
        {!isChatBottomVisible && (
          <ToChatBottomButton onClick={() => scrollToBottom()} />
        )}
        {(chatType !== "c" ||
          chatData?.adminIds?.includes((user as User).id)) && (
          <div className="chat-wrapper">
            <MessageCreator scrollToBottomFn={scrollToBottom} />
          </div>
        )}
      </div>
    </div>
  );
};
