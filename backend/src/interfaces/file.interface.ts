type SentInTypes = "inbox" | "project" | "task";

export interface IFile {
  id?: string;
  name: string;
  url: string;
  expiresAt?: string;
  teamId: string;
  sentIn: SentInTypes;
  receivedBy?: string; // Null if it is sent to group
  createdAt: string;
  updatedAt: string;
}
