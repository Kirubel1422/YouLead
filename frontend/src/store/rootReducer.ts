import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import teamReducer from "./team/teamSlice";
import notificationReducer from "./notification/notificationSlice";
import projectReducer from "./projects/projectsSlice";

import authApi from "@/api/auth.api";
import projectsApi from "@/api/projects.api";
import invitationsApi from "@/api/invitations.api";
import teamApi from "@/api/team.api";
import analyticsApi from "@/api/analytics.api";
import tasksApi from "@/api/tasks.api";
import meetingApi from "@/api/meeting.api";
import activityApi from "@/api/activities.api";
import calendarApi from "@/api/calendar.api";
import dmMessageApi from "@/api/messages.api";

const base = combineReducers({
     auth: authReducer,
     team: teamReducer,
     notification: notificationReducer,
     projects: projectReducer,
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
     [meetingApi.reducerPath]: meetingApi.reducer,
     [activityApi.reducerPath]: activityApi.reducer,
     [calendarApi.reducerPath]: calendarApi.reducer,
     [dmMessageApi.reducerPath]: dmMessageApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
