import { IActivity } from "@/types/activity.type";
import { createSlice } from "@reduxjs/toolkit";

interface INotificationState {
     notifications: Array<IActivity>;
}

const initialState: INotificationState = {
     notifications: [],
};

const notificationSlice = createSlice({
     name: " notification",
     initialState,
     reducers: {
          saveNotification: (state, action) => {
               state.notifications = action.payload;
          },
     },
});

export default notificationSlice.reducer;
export const { saveNotification } = notificationSlice.actions;
