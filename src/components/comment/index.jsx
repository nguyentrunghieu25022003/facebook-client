import PropTypes from "prop-types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Link } from "react-router-dom";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  SendIcon,
  EmojiEmotionsIcon,
  CameraAltIcon,
  ThumbUpIcon
} from "../../icons/post.jsx";
import { useEffect, useMemo, useState } from "react";
import classNames from "classnames/bind";
import styles from "./comment.module.scss";
import axios from "axios";

const cx = classNames.bind(styles);

const RenderedComments = ({ comments, user, handleEditToggle, handleEditComment, handleDeleteComment, handleLikeComment, editCommentValue, editingCommentId, setEditCommentValue }) => {
  const [commentsState, setCommentsState] = useState(comments);
  const [replyStates, setReplyStates] = useState({});
  const [replyValues, setReplyValues] = useState({});
  const [fileNameReply, setFileNameReply] = useState("");

  const toggleReply = (commentId) => {
    setReplyStates(prev => {
      const updatedState = {
        ...prev,
        [commentId]: !(prev[commentId] ?? false),
      };
      return updatedState;
    });
  };

  const handleFileChangeReply = (e) => {
    const file = e.target.files[0];
    setFileNameReply(file?.name);
  };

  const addEmoji = (emoji, commentId) => {
    setReplyValues((prev) => ({
      ...prev,
      [commentId]: (prev[commentId] || "") + emoji.native,
    }));
  };

  const handleReplyChange = (e, commentId) => {
    const { value } = e.target;
    setReplyValues((prev) => ({
      ...prev,
      [commentId]: value,
    }));
  };

  const handleReplyComment = async (event, commentId) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("userId", user.UserID);
    formData.append("content", replyValues[commentId]);
    const fileInput = document.querySelector(`#file-upload-reply-${commentId}`);
    const file = fileInput?.files[0];
    if (file) {
      formData.append("FileURL", file);
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/page/comment/reply/${commentId}/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      if(response.status === 200) {
        setCommentsState((prevComments) =>
          prevComments.map((comment) => {
            if (comment.CommentID === commentId) {
              const updatedComment = { ...comment, Replies: response.data };
              return updatedComment;
            }
            return comment;
          })
        );
        setReplyValues((prev) => ({ ...prev, [commentId]: "" }));
        setFileNameReply("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setCommentsState(comments);
  }, [comments]);

  const renderedComments = useMemo(() => {
    if (!comments || comments.length === 0) {
      return (
        <div className="text-center mt-5">
          <strong className="text-dark fs-4 fw-medium">There are no comments for this article</strong>
        </div>
      );
    };
  
    return commentsState.map((comment) => {
      const commentDate = new Date(comment?.CreatedAt || comment?.UpdatedAt);
      const date = formatDistanceToNow(commentDate, {
        addSuffix: true,
        locale: vi,
      });

      const isLikeComment = comment?.CommentLikes?.findIndex(like => like.UserID === user.UserID);
  
      return (
        <div key={comment.CommentID} className={cx("comment")}>
          <Link className="mt-5">
            <img
              src={comment?.User?.ProfilePictureURL === "default" ? "/imgs/avatar-trang-4.jpg" : `${import.meta.env.VITE_IMG_URL}${comment?.User?.ProfilePictureURL}`}
              alt="avatar"
              className={cx("comment-avatar")}
            />
          </Link>
          <div>
            <div className="d-flex align-items-center gap-3">
              <div className={cx("msg-box")}>
                <b className="fs-4 fw-bold pt-2">{comment?.User?.Username}</b>
                {editingCommentId === comment?.CommentID ? (
                  <textarea
                    className="fs-4 pt-3 pb-3"
                    value={editCommentValue}
                    onChange={(e) => setEditCommentValue(e.target.value)}
                  />
                ) : (
                  <p className="fs-4 pt-3 pb-3">{comment?.Content}</p>
                )}
                {comment?.ImageURL && (
                  <img
                    src={`${import.meta.env.VITE_IMG_URL}${comment?.ImageURL}`}
                    alt="img"
                    className={cx("comment-img")}
                  />
                )}
                {comment?.VideoURL && (
                  <video controls autoPlay loop className={cx("post-video")}>
                    <source src={`${import.meta.env.VITE_IMG_URL}${comment?.VideoURL}`} type="video/mp4" />
                  </video>
                )}
              </div>
              {user.UserID === comment?.UserID && (
                <Tippy
                  interactive={true}
                  placement="right"
                  arrow={false}
                  trigger="click"
                  content={
                    <div className="d-flex flex-column">
                      <button className="btn fs-5" onClick={() => handleEditToggle(comment)}>
                        Edit
                      </button>
                      {editingCommentId === comment?.CommentID && (
                        <button className="btn fs-5" onClick={() => handleEditComment(comment?.CommentID)}>
                          Save
                        </button>
                      )}
                      <button className="btn fs-5" onClick={() => handleDeleteComment(comment?.CommentID)}>
                        Delete
                      </button>
                    </div>
                  }
                  className={cx("custom-tippy")}
                >
                  <MoreHorizIcon className="fs-2" />
                </Tippy>
              )}
            </div>
            <div className="d-flex align-items-center gap-3 mt-3">
              <span className="fs-5">{date}</span>
              <b className="fs-5 fw-medium" style={ isLikeComment !== -1 ? {color: "var(--primary-color)"} : {} } onClick={() => handleLikeComment(comment?.CommentID)}>Like</b>
              <b className="fs-5 fw-medium" onClick={() => toggleReply(comment?.CommentID)}>Reply</b>
              {comment?.CommentLikes?.length > 0 && <p className="d-flex align-items-center gap-2"><b className="fs-5">{comment?.CommentLikes?.length}</b> <ThumbUpIcon className="d-block mb-1 fs-4 text-primary" /></p>}
            </div>
            <div className={cx("replies")}>
              {comment?.Replies.map((reply, index) => {
                const replyDate = new Date(reply?.CreatedAt || reply?.UpdatedAt);
                const date = formatDistanceToNow(replyDate, { addSuffix: true, locale: vi });
                return (
                  <div key={index} className="d-flex align-items-center gap-4 mt-5">
                    <img
                      src={reply.User.ProfilePictureURL === "default" ? "/imgs/avatar-trang-4.jpg" : `${import.meta.env.VITE_IMG_URL}${reply.User.ProfilePictureURL}`}
                      alt="avatar"
                      className={cx("comment-avatar")}
                    />
                    <div className="d-flex flex-column gap-3">
                      <div className={cx("msg-box")}>
                        <strong className="fs-4 fw-bold pt-2">{reply.User.Username}</strong>
                        <p className="fs-4 pt-3 pb-3">{reply.Content}</p>
                        {reply?.ImageURL && (
                          <img
                            src={`${import.meta.env.VITE_IMG_URL}${reply?.ImageURL}`}
                            alt="img"
                            className={cx("comment-img")}
                          />
                        )}
                        {reply?.VideoURL && (
                          <video controls autoPlay loop className={cx("post-video")}>
                            <source src={`${import.meta.env.VITE_IMG_URL}${reply?.VideoURL}`} type="video/mp4" />
                          </video>
                        )}
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <span className="fs-5">{date}</span>
                        <b className="fs-5 fw-medium" onClick={() => handleLikeComment(reply.CommentID)}>Like</b>
                      </div>
                    </div>
                  </div>
                );
              })}
              {replyStates[comment.CommentID] && (
                <>
                  <div className={cx("user-comment")}>
                    <img
                      src={user.ProfilePictureURL === "default" ? "/imgs/avatar-trang-4.jpg" : `${import.meta.env.VITE_IMG_URL}${user.ProfilePictureURL}`}
                      alt="avatar"
                      className={cx("user-avatar")}
                    />
                    <form className={cx("comment-box")} encType="multipart/form-data" onSubmit={(e) => handleReplyComment(e, comment.CommentID)}>
                      <textarea
                        placeholder="Write a reply..."
                        value={replyValues[comment.CommentID] || ""}
                        onChange={(e) =>handleReplyChange(e, comment.CommentID)}
                      />
                      <div className={cx("more")}>
                        <div className={cx("upload-container")}>
                          <label
                            htmlFor={`file-upload-reply-${comment.CommentID}`}
                            className={cx("custom-file-upload")}
                          >
                            <CameraAltIcon className="fs-3" />
                          </label>
                          <input
                            id={`file-upload-reply-${comment.CommentID}`}
                            type="file"
                            className={cx("file-input")}
                            onChange={handleFileChangeReply}
                            accept="image/*,video/*"
                          />
                        </div>
                        <Tippy
                          interactive={true}
                          arrow={false}
                          trigger="click"
                          content={<Picker data={data} onEmojiSelect={(emoji) => addEmoji(emoji, comment.CommentID)} theme="light" />}
                          className={cx("icon-box")}
                        >
                          <EmojiEmotionsIcon className="fs-3" />
                        </Tippy>
                      </div>
                      <button type="submit">
                        <SendIcon className={cx("icon")} />
                      </button>
                    </form>
                  </div>
                  {fileNameReply && <div className={cx("reply-preview")}>
                    <p className="fs-4">{fileNameReply}</p>
                  </div>}
                </>
              )}
            </div>
          </div>
        </div>
      );
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentsState, handleReplyComment, editCommentValue, editingCommentId, replyStates, replyValues, user.UserID]);

  return (
    <div>{renderedComments}</div>
  );
};

RenderedComments.propTypes = {
  comments: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
  handleEditToggle: PropTypes.func.isRequired,
  handleEditComment: PropTypes.func.isRequired,
  handleDeleteComment: PropTypes.func.isRequired,
  handleLikeComment: PropTypes.func,
  editCommentValue: PropTypes.string.isRequired,
  editingCommentId: PropTypes.number,
  setEditCommentValue: PropTypes.func.isRequired,
};

export default RenderedComments;