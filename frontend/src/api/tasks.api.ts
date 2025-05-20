import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DOTENV } from "@/constants/env";
import { IResponse } from "@/types/response.types";
import { IEditTask, ITaskDetail, ITaskMetaData, TaskFilter } from "@/types/task.types";
import { TaskSchemaType } from "@/schemas/task.schema";

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

          // Handle Task Assignment
          handleTaskAssign: builder.mutation<string, { taskId: string; assignedTo: string[] }>({
               query: ({ taskId, assignedTo }) => ({
                    url: `/assign/${taskId}`,
                    method: "POST",
                    body: { assignedTo },
               }),
               transformResponse: (resp: IResponse) => (resp.success ? "Task assigned!" : ""),
          }),

          // Handle Task Unassignment
          handleTaskUnAssign: builder.mutation<string, { taskId: string; memberId: string }>({
               query: ({ taskId, memberId }) => ({
                    url: `/unassign/${taskId}?memberId=${memberId}`,
                    method: "PUT",
               }),
               transformResponse: (resp: IResponse) => (resp.success ? "Task unassigned!" : ""),
          }),

          // Extend Deadline
          handleDeadline: builder.mutation<string, Record<string, string>>({
               query: ({ deadline, taskId }) => ({
                    url: `/deadline/${taskId}?newDeadline=${deadline}`,
                    method: "PUT",
               }),

               transformResponse: (resp: IResponse) => (resp.success ? "Deadline updated!" : ""),

               invalidatesTags: (_: string | undefined) => (_ != "" ? [{ type: "Tasks", id: "LIST" }] : []),
          }),

          // Update Task
          updateTask: builder.mutation<string, { taskId: string; body: IEditTask }>({
               query: ({ taskId, body }) => ({
                    url: `/update/${taskId}`,
                    method: "PUT",
                    body,
               }),

               transformResponse: (respo: IResponse) => (respo.success ? "Task updated successfully!" : ""),

               invalidatesTags: (res) => (res != "" ? [{ type: "Tasks" as const, id: "LIST" }] : []),
          }),

          // Create Task
          createTask: builder.mutation<string, TaskSchemaType>({
               query: (body) => ({
                    url: "/create",
                    body,
                    method: "POST",
               }),

               transformResponse: (res: IResponse) => (res.success ? "Task created successfully" : ""),

               invalidatesTags: (res: string | undefined) =>
                    res != "" ? [{ type: "Tasks" as const, id: "LIST" }] : [],
          }),
     }),
});

export const {
     useMyTasksQuery,
     useMarkTaskCompleteMutation,
     useUpdateProgressMutation,
     useHandleTaskAssignMutation,
     useHandleTaskUnAssignMutation,
     useHandleDeadlineMutation,
     useUpdateTaskMutation,
     useCreateTaskMutation,
} = tasksApi;
export default tasksApi;
