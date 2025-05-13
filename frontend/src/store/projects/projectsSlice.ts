import { IProject, ProjectState } from "@/types/project.types";
import { createSlice } from "@reduxjs/toolkit";

const initialState: ProjectState = {
     projects: [] as IProject[],
};

const projectSlice = createSlice({
     name: "project",
     initialState,
     reducers: {
          saveProjects: (state, action) => {
               state.projects = action.payload;
          },
          addProject: (state, action) => {
               state.projects.push(action.payload);
          },
          updateProject: (state, action) => {
               const index = state.projects.findIndex((project) => project.id === action.payload.id);
               if (index !== -1) {
                    state.projects[index] = action.payload;
               }
          },
          deleteProject: (state, action) => {
               state.projects = state.projects.filter((project) => project.id !== action.payload);
          },
     },
});

export const { saveProjects, addProject, updateProject, deleteProject } = projectSlice.actions;
export default projectSlice.reducer;
