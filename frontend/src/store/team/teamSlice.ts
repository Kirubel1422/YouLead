import { TeamState } from "@/types/team.types";
import { createSlice } from "@reduxjs/toolkit";

const initialState: TeamState = {
     team: null,
};

const teamSlice = createSlice({
     name: "team",
     initialState,
     reducers: {
          setTeam: (state, action) => {
               state.team = action.payload;
          },
          removeTeam: (state) => {
               state.team = null;
          },
     },
});

export const { removeTeam, setTeam } = teamSlice.actions;
export default teamSlice.reducer;
