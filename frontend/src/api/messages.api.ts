import { DOTENV } from "@/constants/env";
import { IChat } from "@/types/messages.types";
import { IResponse } from "@/types/response.types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const messagesApi = createApi({
     reducerPath: "messagesApi",
     baseQuery: fetchBaseQuery({
          baseUrl: DOTENV.API_ENDPOINT + "/chat",
          credentials: "include",
     }),
     tagTypes: ["Messages"],
     endpoints: (builder) => ({
          // Fetch messages
          fetchDMMessages: builder.query<IChat[], void>({
               query: () => ({
                    url: `/messages`,
               }),
               transformResponse: (resp: IResponse) => (resp.success ? resp.data : []),
               providesTags: (resp: IChat[] | undefined) =>
                    Array.isArray(resp) && resp.length > 0
                         ? [
                                { type: "Messages", id: "LIST" },
                                ...resp.map(({ userId }) => ({ type: "Messages" as const, id: userId })),
                           ]
                         : [],
               keepUnusedDataFor: 0,
          }),
     }),
});

export const { useFetchDMMessagesQuery } = messagesApi;
export default messagesApi;
