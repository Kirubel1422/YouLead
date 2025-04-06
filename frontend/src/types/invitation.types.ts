export type InvitationStatus = "pending" | "accepted" | "rejected";

export interface IInvitation {
     inviteeEmail: string;
     teamId: string;
     invitationStatus: InvitationStatus;
     inviteeLeft: boolean;

     createdAt: string;
     updatedAt: string;
     id: string;
}
