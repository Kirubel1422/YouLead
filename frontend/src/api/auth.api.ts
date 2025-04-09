import { LoginSchemaType, SignUpSchemaType } from "@/schemas/auth.schema";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DOTENV } from "@/constants/env";
import { IUser } from "@/types/user.types";
import { IResponse } from "@/types/response.types";

const authApi = createApi({
     reducerPath: "authApi",
     baseQuery: fetchBaseQuery({
          baseUrl: DOTENV.API_ENDPOINT + "/auth",
          credentials: "include",
     }),

     endpoints: (builder) => ({
          login: builder.mutation({
               query: (credentials: LoginSchemaType) => ({
                    url: "/signin",
                    method: "POST",
                    body: credentials,
               }),
          }),

          signUp: builder.mutation({
               query: (credentials: SignUpSchemaType) => ({
                    url: "/signup",
                    method: "POST",
                    body: credentials,
               }),
          }),

          // Fetch user info
          me: builder.query<Omit<IUser, "previousPasswords">, { location: string }>({
               query: ({ location }) => ({
                    url: `/me?path=${location}`,
               }),

               transformResponse: (resp: IResponse) =>
                    resp.success ? resp.data : ({} as Omit<IUser, "previousPasswords">),
          }),
     }),
});

export const { useLoginMutation, useSignUpMutation, useMeQuery } = authApi;
export default authApi;
