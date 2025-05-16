import { DOTENV } from "@/constants/env";
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
               query: ({ page = 1, limit, teamId }) => ({
                    url: `/my?teamId=${teamId}&page=${page}&limit=${limit}`,
                    credentials: "include",
               }),

               transformResponse: (resp: IResponse) => (resp.success ? resp.data : ({} as IProject)),
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
     }),
});

export const { useFetchMyProjectsQuery, useLazyFetchProjectMembersQuery } = projectsApi;
export default projectsApi;
