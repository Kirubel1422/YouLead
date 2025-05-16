import { IProfile } from "./user.types";

export type SentInTypes = "dm" | "project" | "task";
export type ReadMessageType = Partial<IProfile>;

export interface IMessage {
     id?: string;
     sentBy: string;
     readBy?: ReadMessageType[];
     sentIn: SentInTypes;
     receivedBy: string; // Represent's UID, Project ID, and Task ID
     fileId?: string;
     editted?: boolean;
     isRead: boolean;
     
     msgContent: string;

     createdAt?: string;
     updatedAt?: string;
}

export type OnlineStatus = "online" | "offline";
export type ChatType = "dm" | "project" | "task";

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
     userId: string;
     userData: IChatUser;
     msgs: IMessage[];
     // unreadCount: number;
     msgCount: number;
     lastMsg: Partial<IMessage>;
     type: ChatType;
     participants?: IChatUser[];
}
