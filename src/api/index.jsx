import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchUserProfile = async (userId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/page/profile/${userId}`
    );
    if (response.status === 200) {
      return response.data;
    }
    return null;
  } catch (err) {
    console.error(err);
  }
};

export const fetchAllNotification = async (userId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/page/notifications/${userId}`
    );
    if (response.status === 200) {
      return response.data;
    }
    return null;
  } catch (err) {
    console.error(err);
  }
};

export const fetchAllMyPost = async (userId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/page/${userId}/all-post`
    );
    if (response.status === 200) {
      return response.data;
    }
    return null;
  } catch (err) {
    console.error(err);
  }
};

export const fetchAllMyVideoPost = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/page/videos/all`
    );
    if (response.status === 200) {
      return response.data;
    }
    return null;
  } catch (err) {
    console.error(err);
  }
};

export const fetchAllFriendListSuggested = async (userId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/page/friends/suggested/${userId}`
    );
    if (response.status === 200) {
      return response.data;
    }
    return null;
  } catch (err) {
    console.error(err);
  }
};

export const fetchAllFriendListUnfriend = async (userId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/page/unfriend/all/${userId}`
    );
    if (response.status === 200) {
      return response.data;
    }
    return null;
  } catch (err) {
    console.error(err);
  }
};

export const fetchLastMessage = async (userId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/message/unread-messages/${userId}`
    );
    if (response.status === 200) {
      return response.data;
    }
    return null;
  } catch (err) {
    console.error(err);
  }
};

export const fetchPostDetail = async (postId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/page/post/detail/${postId}`, { 
        withCredentials: true
      }
    );
    if (response.status === 200) {
      return response.data;
    }
    return null;
  } catch (err) {
    console.error(err);
  }
};

export const fetchAllStories = async (userId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/page/posts/${userId}`
    );
    if (response.status === 200) {
      return response.data.stories;
    }
    return null;
  } catch (err) {
    console.error(err);
  }
};

export const fetchAllPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (userId, { rejectedWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/page/posts/${userId}`
      );
      if (response.status === 200) {
        return response.data.posts;
      }
    } catch (err) {
      rejectedWithValue(err);
    }
  }
);

export const fetchAllFriendsList = createAsyncThunk(
  "/friends/fetchFriends",
  async (userId, { rejectedWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/page/friends/${userId}`
      );
      if (response.status === 200) {
        return response.data;
      }
    } catch (err) {
      rejectedWithValue(err);
    }
  }
);

export const fetchAllMessages = createAsyncThunk(
  "/messages/fetchMessages",
  async ({ senderId, receiverId }, { rejectedWithValue }) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/message/all-messages/${senderId}/${receiverId}`
      );
      if (response.status === 200) {
        return response.data;
      }
    } catch (err) {
      rejectedWithValue(err);
    }
  }
);

