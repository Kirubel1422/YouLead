import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DOTENV } from "@/constants/env";
import { IAnalyticsMain, IMembersAnalytics, ITeamAnalytics } from "@/types/analytics.types";
import { IResponse } from "@/types/response.types";

const analyticsApi = createApi({
     reducerPath: "analyticsApi",
     baseQuery: fetchBaseQuery({
          baseUrl: DOTENV.API_ENDPOINT + "/analytics",
          credentials: "include",
     }),

     tagTypes: ["Analytics"],

     endpoints: (builder) => ({
          getMain: builder.query<IAnalyticsMain, void>({
               query: () => "/main",

               transformResponse: (response: IResponse) => (response.success ? response.data : ({} as IAnalyticsMain)),

               providesTags: (result: IAnalyticsMain | undefined) =>
                    !!result ? [{ type: "Analytics" as const, id: "LIST" }] : [],
          }),

          // Get Team Members Analytics
          getTeamMembersAnalytics: builder.query<IMembersAnalytics[], void>({
               query: () => ({
                    url: "/team/members",
               }),

               transformResponse: (res: IResponse) => (res.success ? (res.data as IMembersAnalytics[]) : []),

               providesTags: (res: IMembersAnalytics[] | undefined) =>
                    Array.isArray(res) && res.length > 0
                         ? [
                                ...res.map((member) => ({ type: "Analytics" as const, id: member.id })),
                                { type: "Analytics" as const, id: "LIST" },
                           ]
                         : [],
          }),

          // Team Analytics for Team Leader
          getTeamAnalytics: builder.query<ITeamAnalytics, void>({
               query: () => "/team",

               transformResponse: (res: IResponse) =>
                    res.success ? (res.data as ITeamAnalytics) : ({} as ITeamAnalytics),
          }),
     }),
});

export const { useGetMainQuery, useGetTeamMembersAnalyticsQuery, useGetTeamAnalyticsQuery } = analyticsApi;
export default analyticsApi;
