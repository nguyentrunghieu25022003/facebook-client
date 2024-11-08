import { createSlice } from "@reduxjs/toolkit";
import { fetchAllPosts } from "../../api/index";

const postsSlice = createSlice({
  name: "posts",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    addPost(state, action) {
      const newPost = {
        ...action.payload,
        Likes: [],
        Comments: []
      };
      state.items = [newPost, ...state.items];
    },
    updatePost(state, action) {
      const index = state.items.findIndex(item => item.PostID === action.payload.PostID);
      if (index !== -1) {
        state.items[index].Content = action.payload.Content;
      }
    },
    removePost(state, action) {
      state.items = state.items.filter(post => post.PostID !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPosts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addPost, updatePost, removePost } = postsSlice.actions;
export default postsSlice.reducer;