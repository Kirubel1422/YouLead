import { DOTENV } from "@/constants/env";
import { type Event } from "@/types/calendar.type";
import { IResponse } from "@/types/response.types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const calendarApi = createApi({
     reducerPath: "calendarApi",

     baseQuery: fetchBaseQuery({
          baseUrl: DOTENV.API_ENDPOINT + "/calendar",
          credentials: "include",
     }),

     tagTypes: ["Calendar"],

     endpoints: (builder) => ({
          myEvents: builder.query<Event[], void>({
               query: () => "/my",

               transformResponse: (resp: IResponse) => (resp.success ? resp.data : []),

               providesTags: (resp: Event[] | undefined) =>
                    Array.isArray(resp)
                         ? resp.map((resp: Event) => ({ type: "Calendar" as const, id: resp.id }))
                         : [{ type: "Calendar" as const, id: "LIST" }],
          }),

          taskPrioritizationSuggestion: builder.query<string, void>({
               query: () => "/task-prioritization",

               transformResponse: (res: IResponse) => (res.success ? res.data : ""),
          }),
     }),
});

export const { useMyEventsQuery, useLazyTaskPrioritizationSuggestionQuery } = calendarApi;
export default calendarApi;
