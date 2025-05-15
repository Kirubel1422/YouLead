import { IProfile } from "./user.interface";

type SentInTypes = "inbox" | "project" | "task";
export type ReadMessageType = Partial<IProfile>;

export interface IMessage {
  id?: string;
  sentBy: string;
  readBy?: ReadMessageType[];
  sentIn: SentInTypes;
  receivedBy: string; // Represent's UID, Project ID, and Task ID
  fileId?: string;
  editted?: boolean;

  msgContent: string;

  createdAt?: string;
  updatedAt?: string;
}

type OnlineStatus = "online" | "offline";
type ChatType = "dm" | "project" | "task";

export interface IChatUser {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  status: OnlineStatus;
  lastSeen?: string;
  role?: string;
}

export interface IChat {
  id: string;
  type: ChatType;
  name: string;
  participants: IChatUser[];
  lastMessage?: Partial<IMessage>;
  // unreadCount: number;
  icon?: string;
}
