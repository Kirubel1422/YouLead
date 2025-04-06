import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import teamReducer from "./team/teamSlice";
import authApi from "@/api/auth.api";
import projectsApi from "@/api/projects.api";
import invitationsApi from "@/api/invitations.api";
import teamApi from "@/api/team.api";
import analyticsApi from "@/api/analytics.api";
import tasksApi from "@/api/tasks.api";

const base = combineReducers({
     auth: authReducer,
     team: teamReducer,
});

const rootReducer = combineReducers({
     // Persist only base reducers
     base,

     [authApi.reducerPath]: authApi.reducer,
     [projectsApi.reducerPath]: projectsApi.reducer,
     [invitationsApi.reducerPath]: invitationsApi.reducer,
     [teamApi.reducerPath]: teamApi.reducer,
     [analyticsApi.reducerPath]: analyticsApi.reducer,
     [tasksApi.reducerPath]: tasksApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
