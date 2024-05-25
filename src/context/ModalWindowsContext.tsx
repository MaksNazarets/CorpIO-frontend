import { ReactNode, createContext, useContext, useState } from "react";
import MediaViewer from "../shared/components/MediaViewer";
import ProfileViewer from "../shared/components/ProfileViewer";
import ChatMemberViewer from "../pages/DepartmentEmployee/chats/components/ChatMembersViewer";

type ModalWindowsContextType = {
  mediaViewerFileId: number | null;
  setMediaViewerFileId: React.Dispatch<React.SetStateAction<number | null>>;
  setProfileViewerUserId: React.Dispatch<React.SetStateAction<number | null>>;
  setGroupMemberViewerGroupId: React.Dispatch<
    React.SetStateAction<number | null>
  >;
};

export const ModalWindowsContext =
  createContext<ModalWindowsContextType | null>(null);

export const useModalWindowsContext = (): ModalWindowsContextType => {
  const context = useContext(ModalWindowsContext);
  if (!context) {
    throw new Error(
      "useModalWindowsContext must be used within a MediaViewerProvider"
    );
  }
  return context;
};

interface ModalWindowsProviderProps {
  children: ReactNode;
}

export const ModalWindowsProvider = ({
  children,
}: ModalWindowsProviderProps) => {
  const [mediaViewerFileId, setMediaViewerFileId] = useState<number | null>(
    null
  );
  const [profileViewerUserId, setProfileViewerUserId] = useState<number | null>(
    null
  );
  const [groupMemberViewerGroupId, setGroupMemberViewerGroupId] = useState<
    number | null
  >(null);

  return (
    <ModalWindowsContext.Provider
      value={{
        mediaViewerFileId,
        setMediaViewerFileId,
        setProfileViewerUserId,
        setGroupMemberViewerGroupId,
      }}
    >
      {children}
      {mediaViewerFileId !== null && (
        <MediaViewer
          fileId={mediaViewerFileId}
          closeFn={() => setMediaViewerFileId(null)}
        />
      )}
      {profileViewerUserId !== null && (
        <ProfileViewer
          userId={profileViewerUserId}
          closeFn={() => setProfileViewerUserId(null)}
        />
      )}

      {groupMemberViewerGroupId !== null && (
        <ChatMemberViewer
          groupId={groupMemberViewerGroupId}
          closeFn={() => setGroupMemberViewerGroupId(null)}
        />
      )}
    </ModalWindowsContext.Provider>
  );
};
