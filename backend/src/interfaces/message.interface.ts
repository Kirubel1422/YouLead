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
