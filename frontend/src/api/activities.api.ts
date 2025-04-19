import { DOTENV } from "@/constants/env";
import { IActivity } from "@/types/activity.type";
import { IResponse } from "@/types/response.types";
import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";

const activityApi = createApi({
     reducerPath: "activityApi",

     baseQuery: fetchBaseQuery({
          baseUrl: DOTENV.API_ENDPOINT + "/activities",
          credentials: "include",
     }),

     tagTypes: ["Activities"],

     endpoints: (builder) => ({
          recentActivitites: builder.query<IActivity[], string>({
               query: (teamId) => `/recent?teamId=${teamId}`,

               transformResponse: (resp: IResponse) => (resp.success ? resp.data : []),

               providesTags: (resp: IActivity[] | undefined) =>
                    Array.isArray(resp)
                         ? resp.map((activity: IActivity) => ({ type: "Activities" as const, id: activity.id }))
                         : [{ type: "Activities", id: "LIST" }],
          }),
     }),
});

export const { useRecentActivititesQuery } = activityApi;
export default activityApi;
