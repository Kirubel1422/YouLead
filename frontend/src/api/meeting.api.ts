import { DOTENV } from "@/constants/env";
import { IMeeting } from "@/types/meeting.type";
import { IResponse } from "@/types/response.types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const meetingsApi = createApi({
     reducerPath: "meetingApi",

     baseQuery: fetchBaseQuery({
          baseUrl: DOTENV.API_ENDPOINT + "/meeting",
          credentials: "include",
     }),

     tagTypes: ["Meetings"],

     endpoints: (builder) => ({
          upcomingMeetings: builder.query<IMeeting[], void>({
               query: () => "/upcoming",

               transformResponse: (res: IResponse) => (res.success ? res.data : []),

               providesTags: (res: IMeeting[] | undefined) =>
                    Array.isArray(res)
                         ? res.map((meeting: IMeeting) => ({ type: "Meetings" as const, id: meeting.id }))
                         : [{ type: "Meetings" as const, id: "LIST" }],
          }),
     }),
});

export default meetingsApi;
export const { useUpcomingMeetingsQuery } = meetingsApi;
