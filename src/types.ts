export type MessageType = {
  text: string;
  type: "success" | "warning" | "error";
};

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  patronymic: string;
  username: string;
  email?: string;
  phoneNumber?: string;
  position?: string;
  isSuperAdmin?: true;
  department?: Department;
  isHeadOfDepartment?: boolean;
};

export type Department = {
  id: number;
  name: string;
};

export type ChatMessage = {
  id: number;
  chat: {
    id: number;
  };
  sender: {
    id: number;
    firstName?: string;
    lastName?: string;
  };
  text: string;

  attachments?: { id: number; filename: string; size?: string }[];
  isSeen: boolean;
  timestamp: string;
};

export type GroupChat = {
  id: number;
  name: string;
  isPrivate: boolean;
  creator: User;
};
