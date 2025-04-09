import { DOTENV } from "@/constants/env";
import { IProject, Pagination } from "@/types/project.types";
import { IResponse } from "@/types/response.types";
import { createApi } from "@reduxjs/toolkit/query/react";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface MyProjects {
     total: number;
     projects: IProject[];
}
const projectsApi = createApi({
     reducerPath: "projectsApi",
     baseQuery: fetchBaseQuery({
          baseUrl: DOTENV.API_ENDPOINT + "/projects",
          credentials: "include",
     }),

     endpoints: (builder) => ({
          // Fetch my projects
          fetchMyProjects: builder.query<MyProjects, Pagination & { teamId: string }>({
               query: ({ page = 1, limit, teamId }) => ({
                    url: `/my?teamId=${teamId}&page=${page}&limit=${limit}`,
                    credentials: "include",
               }),

               transformResponse: (resp: IResponse) => (resp.success ? resp.data : ({} as IProject)),
          }),
     }),
});

export const { useFetchMyProjectsQuery } = projectsApi;
export default projectsApi;
