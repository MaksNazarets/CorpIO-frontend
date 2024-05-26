import { animated, easings, useSpring } from "@react-spring/web";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { useAuthContext } from "../../../context/AuthContext";
import { useModalWindowsContext } from "../../../context/ModalWindowsContext";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { User } from "../../../types";
import {
  BASE_API_URL,
  axiosInstance,
  formatBytes,
  getFilenameParts,
} from "../../../untils";
import { ChatListItem } from "../chats/ChatListItem";

type AttachmentProps = { file: { id: number; filename: string; size: number } };

const ProjectAttachment = ({ file }: AttachmentProps) => {
  return (
    <a
      href={`${BASE_API_URL}/projects/get-attachment?attId=${file.id}`}
      download={file.filename}
      className="project-attachment"
      key={file.filename}
    >
      <div className="project-attachment__name">
        <span className="filename">{getFilenameParts(file.filename).name}</span>
        .<span>{getFilenameParts(file.filename).extension}</span>
      </div>
      <div className="project-attachment__size">{formatBytes(file.size)}</div>
    </a>
  );
};

const ProjectMember = ({
  user,
  isManager,
}: {
  user: User;
  isManager?: boolean;
}) => {
  const { setProfileViewerUserId } = useModalWindowsContext();
  const { user: me } = useAuthContext();
  return (
    <div
      className={`project-user ${isManager ? "manager" : ""}`}
      onClick={() =>
        (me as User).id !== user.id && setProfileViewerUserId(user.id)
      }
    >
      <div
        className="project-user-avatar"
        style={{
          backgroundImage: `url('${BASE_API_URL}/users/${user.id}/avatar')`,
        }}
      ></div>
      <div className="project-user-info">
        <div className="project-user-name">
          {user.lastName} {user.firstName} {user.patronymic ?? user.patronymic}{" "}
          {(me as User).id === user.id && "(Ви)"}
        </div>
        <div className="project-user-position">{user.position}</div>
      </div>
    </div>
  );
};

function ProjectPage() {
  const { projectId } = useParams();
  const [projectData, setProjectData] = useState<{ [key: string]: any } | null>(
    null
  );

  const { isLoading: isDataLoading } = useQuery({
    queryKey: ["get-project-data-" + projectId],
    queryFn: () =>
      axiosInstance.get("/projects/get-project-data?pid=" + projectId),

    onSuccess(res) {
      console.log("Received project data: ", res.data);
      setProjectData(res.data);
    },

    onError(err: any) {
      console.error("Error while receiving project data:", err.response);
    },

    retry(failureCount) {
      if (failureCount > 2) return false;
      return true;
    },
  });

  useEffect(() => {
    const prevTitle = document.title;

    document.title = projectData?.name || "...";

    return () => {
      document.title = prevTitle;
    };
  }, [projectData?.id]);

  const springs = isDataLoading
    ? useSpring({})
    : useSpring({
        from: {
          transform: "translateY(5px)",
          opacity: 0,
        },
        to: {
          transform: "translateY(0)",
          opacity: 1,
        },
        config: { duration: 200, easing: easings.easeOutSine },
      });

  useEffect(() => {
    return () => setProjectData(null);
  }, [projectId]);

  return (
    <div className="project-page">
      <div className="chat-header">
        <div className="chat-info">
          {!projectData ? (
            "..."
          ) : (
            <>
              <span className="chat-title">{projectData.name || "..."}</span>
              <span className="chat-user-info">
                {projectData.activeTeamMembers.length} учасник(ів)
              </span>
            </>
          )}
        </div>
      </div>

      <animated.div className="project-info" style={springs}>
        {isDataLoading || !projectData ? (
          <LoadingSpinner size={2} />
        ) : (
          <div className="project-info-wrapper">
            <section>
              <h2>Опис</h2>
              {projectData.description
                ?.split("\n")
                .filter((dp: string) => dp.trim().length > 0)
                .map((dp: string, index: number) => (
                  <React.Fragment key={index}>
                    <p>{dp}</p> <br />
                  </React.Fragment>
                ))}
            </section>

            {projectData.attachments && (
              <section>
                <h2>Прикріплені файли</h2>
                <div className="project-attachment-list">
                  {projectData.attachments.map((a: any) => (
                    <ProjectAttachment file={a} key={a.filename} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2>Команда проєкту</h2>
              <div className="project-users-list">
                {projectData.activeTeamMembers
                  .sort((tm: any) =>
                    tm.user.id === projectData.manager.id ? -1 : 1
                  )
                  .map((tm: any) => (
                    <ProjectMember
                      user={tm.user}
                      key={tm.id}
                      isManager={tm.user.id === projectData.manager.id}
                    />
                  ))}
              </div>
            </section>

            {projectData.groupChat && (
              <section>
                <h2>Груповий чат проєкту</h2>
                {/* <Link to={"/chats/g/" + projectData.groupChat.id}>
                  {projectData.groupChat.name}
                </Link> */}
                <ChatListItem
                  chatId={projectData.groupChat.id}
                  chatType={"g"}
                  chatName={projectData.groupChat.name}
                  unreadMsgsNumber={0}
                  hideUnreadNumber
                />
              </section>
            )}
          </div>
        )}
      </animated.div>
    </div>
  );
}

export default ProjectPage;
