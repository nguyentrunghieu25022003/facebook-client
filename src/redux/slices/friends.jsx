import { createSlice } from "@reduxjs/toolkit";
import { fetchAllFriendsList } from "../../api/index";

const friendsSlice = createSlice({
    name: "friends",
    initialState: {
        items: {},
        loading: false,
        error: null
    },
    reducers: {
       /* addUser(state, action) {

       },
       updateUser(state, action) {

       },
       removeUser(state, action) {

       } */
    },
    extraReducers: (builder) => {
        builder
          .addCase(fetchAllFriendsList.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(fetchAllFriendsList.fulfilled, (state, action) => {
            state.items = action.payload;
            state.loading = false;
          })
          .addCase(fetchAllFriendsList.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          });
      },
});

export const { addUser, updateUser, removeUser } = friendsSlice.actions;
export default friendsSlice.reducer;