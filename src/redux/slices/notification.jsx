import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
});
