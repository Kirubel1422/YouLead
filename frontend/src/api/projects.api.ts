import { DOTENV } from "@/constants/env";
import { ProjectSchemaType } from "@/schemas/project.schema";
import { IProject, Pagination } from "@/types/project.types";
import { IResponse } from "@/types/response.types";
import { createApi } from "@reduxjs/toolkit/query/react";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface IMyProjects {
     total: number;
     projects: Partial<IProject>[];
}

export interface IProjectMembers {
     id: string;
     name: string;
     email: string;
     role: string;
     avatar: string;
}

const projectsApi = createApi({
     reducerPath: "projectsApi",
     baseQuery: fetchBaseQuery({
          baseUrl: DOTENV.API_ENDPOINT + "/projects",
          credentials: "include",
     }),

     tagTypes: ["Projects"],

     endpoints: (builder) => ({
          // Fetch my projects
          fetchMyProjects: builder.query<IMyProjects, Pagination & { teamId: string }>({
               query: ({ page = 1, limit = 1000, teamId }) => ({
                    url: `/my?teamId=${teamId}&page=${page}&limit=${limit}`,
                    credentials: "include",
               }),

               transformResponse: (resp: IResponse) => (resp.success ? resp.data : ({} as IProject)),

               providesTags: (resp: IMyProjects | undefined) =>
                    Array.isArray(resp?.projects)
                         ? [
                                ...resp.projects.map((pro) => ({ type: "Projects" as const, id: pro.id })),
                                { type: "Projects" as const, id: "LIST" },
                           ]
                         : [],
          }),

          // Mark Project as complete
          markProjectAsComplete: builder.mutation<string, string>({
               query: (projectId) => "/complete/" + projectId,
               transformResponse: (resp: IResponse) => (resp.success ? "Completed!" : ""),
               invalidatesTags: (resp: string | undefined, _, projectId) =>
                    resp ? [{ type: "Projects" as const, id: projectId }] : [],
          }),

          // Fetch project members
          fetchProjectMembers: builder.query<IProjectMembers[], string>({
               query: (projectId) => `/members/${projectId}`,
               transformResponse: (resp: IResponse) => (resp.success ? resp.data : []),
          }),

          // Add Member to Project
          addToProject: builder.mutation<string, { projectId: string; members: string[] }>({
               query: (projectData) => ({
                    url: `/addMembers/${projectData.projectId}`,
                    method: "POST",
                    body: { members: projectData.members },
               }),

               transformResponse: (resp: IResponse) => (resp.success ? "Successfully added member" : ""),
          }),

          // Remove Member from Project
          removeFromProject: builder.mutation<string, { projectId: string; memberId: string }>({
               query: (data) => ({
                    url: `/remove/${data.projectId}?memberId=${data.memberId}`,
                    method: "PUT",
               }),

               transformResponse: (resp: IResponse) => (resp.success ? "Successfully removed member" : ""),
          }),

          // Create Project Api
          createProject: builder.mutation<string, ProjectSchemaType>({
               query: (body) => ({
                    url: "/create",
                    body,
                    method: "POST",
               }),

               transformResponse: (resp: IResponse) => (resp.success ? "Successfully created Project" : ""),

               invalidatesTags: (resp: string | undefined) =>
                    resp != "" ? [{ type: "Projects" as const, id: "LIST" }] : [],
          }),

          // Edit Project Api
          editProject: builder.mutation<string, Partial<ProjectSchemaType> & { projectId: string }>({
               query: (body) => ({
                    url: `/edit/${body.projectId}`,
                    body,
                    method: "PUT",
               }),

               transformResponse: (resp: IResponse) => (resp.success ? resp.message : ""),

               invalidatesTags: (resp: string | undefined) =>
                    resp != "" ? [{ type: "Projects" as const, id: "LIST" }] : [],
          }),

          // Handle Deadline
          handleDeadline: builder.mutation<string, Record<string, string>>({
               query: ({ deadline, projectId }) => ({
                    url: `/deadline/${projectId}?newDeadline=${deadline}`,
                    method: "PUT",
               }),

               transformResponse: (resp: IResponse) => (resp.success ? "Deadline updated!" : ""),

               invalidatesTags: (_: string | undefined) => (_ != "" ? [{ type: "Projects" as const, id: "LIST" }] : []),
          }),
     }),
});

export const {
     useFetchMyProjectsQuery,
     useLazyFetchProjectMembersQuery,
     useFetchProjectMembersQuery,
     useAddToProjectMutation,
     useRemoveFromProjectMutation,
     useCreateProjectMutation,
     useEditProjectMutation,
     useHandleDeadlineMutation,
} = projectsApi;
export default projectsApi;
