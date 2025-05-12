import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DOTENV } from "@/constants/env";
import { IResponse } from "@/types/response.types";
import { ITaskDetail, ITaskMetaData, TaskFilter } from "@/types/task.types";

export interface IMyTasksResponse {
     tasks: ITaskDetail[];
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
          myTasks: builder.query<IMyTasksResponse, TaskFilter>({
               query: (deadline) => `/my${deadline ? `?deadline=${deadline}` : ""}`,

               transformResponse: (res: IResponse) => (res.statusCode === 200 ? res.data : ({} as IMyTasksResponse)),

               providesTags: (res: IMyTasksResponse | undefined) =>
                    res
                         ? [
                                ...res.tasks.map(({ id }) => ({ type: "Tasks" as const, id })),
                                { type: "Tasks", id: "LIST" },
                           ]
                         : [{ type: "Tasks", id: "LIST" }],
          }),

          // Mark Task As Complete
          markTaskComplete: builder.mutation<string, string>({
               query: (taskId) => ({ url: `/complete/${taskId}`, method: "PUT" }),

               transformResponse: (resp: IResponse) => (resp.success ? resp.message : ""),

               invalidatesTags: (msg: string | undefined, _, id: string) =>
                    !!msg ? [{ type: "Tasks" as const, id }] : [],
          }),

          // Update Task Progress
          updateProgress: builder.mutation<string, ITaskMetaData>({
               query: (taskData) => ({
                    url: `/progress?taskId=${taskData.taskId}&progress=${taskData.progress}`,
                    method: "PUT",
               }),

               transformResponse: (resp: IResponse) => (resp.success ? "Progress saved!" : ""),

               invalidatesTags: (msg: string | undefined, _, taskData: ITaskMetaData) =>
                    !!msg ? [{ type: "Tasks" as const, id: taskData.taskId }] : [],
          }),
     }),
});

export const { useMyTasksQuery, useMarkTaskCompleteMutation, useUpdateProgressMutation } = tasksApi;
export default tasksApi;
