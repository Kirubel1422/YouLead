import { AuthState } from "@/types/auth.types";
import { createSlice } from "@reduxjs/toolkit";

const initialState: AuthState = {
     isAuthenticated: false,
     user: null,
     hasTeam: null,
};

const authSlice = createSlice({
     name: "auth",
     initialState,
     reducers: {
          login: (state, action) => {
               state.isAuthenticated = true;
               state.user = action.payload;
          },
          logout: (state) => {
               state.isAuthenticated = false;
               state.user = null;
               localStorage.clear();
               window.location.href = "/login";
          },
          updateUser: (state, action) => {
               state.user = action.payload;
          },
          setUserTeamState: (state, action) => {
               state.hasTeam = action.payload.hasTeam;
          },
     },
});

export const { login, logout, updateUser, setUserTeamState } = authSlice.actions;
export default authSlice.reducer;
