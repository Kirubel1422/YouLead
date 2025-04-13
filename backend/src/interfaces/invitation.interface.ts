export type InvitationStatus = "pending" | "accepted" | "rejected";
export type InvitationDocStatus = "active" | "inactive";

export interface IInvitation {
  inviteeEmail: string;
  teamId: string;
  invitationStatus: InvitationStatus;
  inviteeLeft: boolean;
  status?: InvitationDocStatus; // State to handle deleting

  createdAt: string;
  updatedAt: string;
}
