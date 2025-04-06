import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import authApi from "@/api/auth.api";
import { persistStore, persistReducer, PURGE, FLUSH, REHYDRATE, PAUSE, PERSIST, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { setupListeners } from "@reduxjs/toolkit/query";
import projectsApi from "@/api/projects.api";
import invitationsApi from "@/api/invitations.api";
import teamApi from "@/api/team.api";
import analyticsApi from "@/api/analytics.api";
import tasksApi from "@/api/tasks.api";

const config = {
     key: "root",
     storage,
     whitelist: ["base"], // Only persist the base reducer
};

const persistedReducer = persistReducer(config, rootReducer);

const middlewares = [
     authApi.middleware,
     projectsApi.middleware,
     invitationsApi.middleware,
     teamApi.middleware,
     analyticsApi.middleware,
     tasksApi.middleware,
];

export const store = configureStore({
     reducer: persistedReducer,
     middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware({
               serializableCheck: {
                    ignoredActions: [PURGE, FLUSH, REHYDRATE, PAUSE, PERSIST, REGISTER],
               },
          }).concat(middlewares), // Add any additional middleware here
});

setupListeners(store.dispatch);
export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
