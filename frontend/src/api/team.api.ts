import { DOTENV } from "@/constants/env";
import { IResponse } from "@/types/response.types";
import { ITeam, ITeamMember } from "@/types/team.types";
import { createApi } from "@reduxjs/toolkit/query/react";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface IJoinTeamResponse {
     message: string;
     data: ITeam;
}

const teamApi = createApi({
     reducerPath: "teamApi",
     baseQuery: fetchBaseQuery({
          baseUrl: DOTENV.API_ENDPOINT + "/teams",
          credentials: "include",
     }),
     tagTypes: ["Teams", "TeamMembers"],

     endpoints: (builder) => ({
          // Join team by id
          joinTeam: builder.mutation<IJoinTeamResponse, { teamId: string }>({
               query: ({ teamId }) => ({
                    method: "PUT",
                    url: `/join?teamId=${teamId}`,
               }),

               transformResponse: (response: any) => ({
                    message: response.message,
                    data: response.data,
               }),
          }),

          // GET: team information

          // GET: team members
          getTeamMembers: builder.query<ITeamMember[], string>({
               query: (teamId) => ({
                    url: `/members/${teamId}`,
               }),

               transformResponse: (response: IResponse) => (response.success ? response.data : null),

               providesTags: (result: ITeamMember[] | undefined) =>
                    Array.isArray(result)
                         ? [
                                ...result.map(({ id }) => ({ type: "TeamMembers" as const, id })),
                                { type: "TeamMembers" as const, id: "LIST" },
                           ]
                         : [{ type: "TeamMembers" as const, id: "LIST" }],
          }),
     }),
});

export const { useJoinTeamMutation, useGetTeamMembersQuery } = teamApi;
export default teamApi;
