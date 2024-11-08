const commentsReducer = (state, action) => {
  switch (action.type) {
    case "ADD_COMMENT":
      return [
        {
          ...action.payload,
          replies: [],
        },
        ...state
      ];
    case "EDIT_COMMENT":
      return state.map((comment) =>
        comment.CommentID === action.payload.CommentID ? { ...comment, Content: action.payload.Content } : comment
      );
    case "DELETE_COMMENT":
      return state.filter((comment) => comment.CommentID !== action.payload);
    case "SET_COMMENTS":
      return action.payload.map((comment) => ({
        ...comment,
        replies: comment.replies || [],
      }));
    default:
      return state;
  }
};

export default commentsReducer;