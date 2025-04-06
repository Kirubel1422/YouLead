import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DOTENV } from "@/constants/env";
import { IAnalyticsMain } from "@/types/analytics.types";
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
               query: () => "/analytics/main",

               transformResponse: (response: IResponse) => (response.sucess ? response.data : ({} as IAnalyticsMain)),

               providesTags: (result: IAnalyticsMain | undefined) =>
                    !!result ? [{ type: "Analytics" as const, id: "LIST" }] : [],
          }),
     }),
});

export const { useGetMainQuery } = analyticsApi;
export default analyticsApi;
