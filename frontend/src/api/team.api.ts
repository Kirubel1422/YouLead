import { DOTENV } from "@/constants/env";
import { ITeam } from "@/types/team.types";
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
     tagTypes: ["Teams"],

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
     }),
});

export const { useJoinTeamMutation } = teamApi;
export default teamApi;
