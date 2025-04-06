import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DOTENV } from "@/constants/env";
import { IResponse } from "@/types/response.types";
import { ITask } from "@/types/task.types";

export interface IMyTasksResponse {
     tasks: ITask[];
     total: number;
}

const tasksApi = createApi({
     reducerPath: "tasksApi",
     baseQuery: fetchBaseQuery({
          baseUrl: DOTENV.API_ENDPOINT + "/tasks",
          credentials: "include",
     }),

     tagTypes: ["Tasks"],

     endpoints: (builder) => ({
          myTasks: builder.query<IMyTasksResponse, void>({
               query: () => "/my",

               transformResponse: (res: IResponse) => (res.statusCode === 200 ? res.data : ({} as IMyTasksResponse)),

               providesTags: (res: IMyTasksResponse | undefined) =>
                    res
                         ? [
                                ...res.tasks.map(({ id }) => ({ type: "Tasks" as const, id })),
                                { type: "Tasks", id: "LIST" },
                           ]
                         : [{ type: "Tasks", id: "LIST" }],
          }),
     }),
});

export const { useMyTasksQuery } = tasksApi;
export default tasksApi;
