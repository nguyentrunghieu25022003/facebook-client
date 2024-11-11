import { createSlice } from "@reduxjs/toolkit";
import { fetchAllMessages } from "../../api/index";

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    chatBoxer: {},
    loading: false,
    error: null,
  },
  reducers: {
    addMessage(state, action) {
      const { SenderID, ReceiverID } = action.payload;
      const key = [SenderID, ReceiverID].sort().join("-");
      if (!state.chatBoxer[key]) {
        state.chatBoxer[key] = { messages: [action.payload] };
      } else {
        const messageExists = state.chatBoxer[key].some(msg => msg.MessageID === action.payload.MessageID);
        if (!messageExists) {
          state.chatBoxer[key].push(action.payload);
        }
      }
    },
    readMessage(state, action) {
      const { SenderID, ReceiverID } = action.payload;
      const key = [SenderID, ReceiverID].sort().join("-");
      if(state.chatBoxer[key]) {
        const messages = state.chatBoxer[key].map((msg, index) => {
          if(index === state.chatBoxer[key].length  - 1 && msg.IsRead === false) {
            return {
              ...msg,
              IsRead: true
            };
          }
          return msg;
        });
        state.chatBoxer[key] = messages;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMessages.fulfilled, (state, action) => {
        const { senderId, receiverId, messages } = action.payload;
        const key = [senderId, receiverId].sort().join("-");
        state.chatBoxer[key] = messages;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAllMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setMessages, addMessage, readMessage } = messagesSlice.actions;
export default messagesSlice.reducer;