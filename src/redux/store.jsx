import { configureStore } from "@reduxjs/toolkit";
import postsReducer from "./slices/posts";
import friendsReducer from "./slices/friends";
import messagesReducer from "./slices/messages";

const store = configureStore({
  reducer: {
    posts: postsReducer,
    friends: friendsReducer,
    messages: messagesReducer
  },
});

export default store;