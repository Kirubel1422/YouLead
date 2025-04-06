import { DOTENV } from "@/constants/env";
import { Pagination } from "@/types/project.types";
import { createApi } from "@reduxjs/toolkit/query/react";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const projectsApi = createApi({
     reducerPath: "projectsApi",
     baseQuery: fetchBaseQuery({
          baseUrl: DOTENV.API_ENDPOINT + "/projects",
          credentials: "include",
     }),

     endpoints: (builder) => ({
          // Fetch my projects
          fetchMyProjects: builder.query({
               query: ({ page = 1, limit, teamId }: Pagination & { teamId: string }) => ({
                    url: `/my?teamId=${teamId}&page=${page}&limit=${limit}`,
                    credentials: "include",
               }),
          }),
     }),
});

export const { useFetchMyProjectsQuery } = projectsApi;
export default projectsApi;
