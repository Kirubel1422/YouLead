import { DOTENV } from "@/constants/env";
import { IInvitation } from "@/types/invitation.types";
import { IResponse } from "@/types/response.types";
import { ITeamDetail } from "@/types/team.types";
import { createApi } from "@reduxjs/toolkit/query/react";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface IMyInvitationData extends Partial<IInvitation> {
     team: Partial<ITeamDetail>;
}

interface IMyInvitation {
     data: IMyInvitationData[];
     total: number;
}

const invitationsApi = createApi({
     reducerPath: "invitationsApi",
     baseQuery: fetchBaseQuery({
          baseUrl: DOTENV.API_ENDPOINT + "/invitations",
          credentials: "include",
     }),

     tagTypes: ["Invitations"],

     endpoints: (builder) => ({
          fetchMyInvitations: builder.query<IMyInvitation, { email: string }>({
               query: ({ email }) => ({
                    url: `/my?email=${email}`,
                    credentials: "include",
               }),
               providesTags: (result) =>
                    Array.isArray(result?.data)
                         ? [
                                ...result.data.map((res) => ({
                                     type: "Invitations" as const,
                                     id: res.id,
                                })),
                                { type: "Invitations", id: "LIST" },
                           ]
                         : [{ type: "Invitations", id: "LIST" }],
          }),

          respond: builder.mutation<{ message: string }, { invitationId: string; response: "accepted" | "rejected" }>({
               query: ({ invitationId, response }) => ({
                    method: "POST",
                    url: `/respond/${invitationId}/${response}`,
               }),
               invalidatesTags: [{ type: "Invitations", id: "LIST" }],
          }),

          // Invite Team Members
          invite: builder.mutation<string, Record<string, string>>({
               query: (body) => ({
                    url: "/invite",
                    body,
                    method: "POST",
               }),

               transformResponse: (resp: IResponse) => (resp.success ? "Successfully sent invitation" : ""),
          }),
     }),
});

export const { useFetchMyInvitationsQuery, useRespondMutation, useInviteMutation } = invitationsApi;
export default invitationsApi;
