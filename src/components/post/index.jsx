import PropTypes from "prop-types";
import axios from "axios";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useEffect, useReducer, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import classNames from "classnames/bind";
import styles from "./post.module.scss";
import {
  PublicIcon,
  CloseIcon,
  MoreHorizIcon,
  ThumbUpOutlinedIcon,
  ModeCommentOutlinedIcon,
  ShareIcon,
  ThumbUpIcon,
  SendIcon,
  ArrowDropDownIcon,
  EmojiEmotionsIcon,
  CameraAltIcon,
  BookmarkIcon,
  EditIcon,
  DeleteIcon,
} from "../../icons/post.jsx";
import commentsReducer from "../../localState/comments";
import RenderedComments from "../comment/index";
import { removePost, updatePost } from "../../redux/slices/posts";

const cx = classNames.bind(styles);

const PostItem = ({ post, isSelected, setRefreshTrigger, handleSelectPost, user }) => {
  const [likes, setLikes] = useState(post?.Likes || []);
  const [commentValue, setCommentValue] = useState("");
  const [filter, setFilter] = useState("default");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentValue, setEditCommentValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editPostValue, setEditPostValue] = useState("");
  const [comments, dispatch] = useReducer(commentsReducer, post?.Comments || []);
  const dispatchMyPost = useDispatch();
  const tippyRef = useRef(null);
  const tippyRefBox = useRef(null);
  const isLikedByCurrentUser = likes.some(like => like.UserID === user?.UserID);
  const dateToFormat = new Date(post.UpdatedAt);
  const date = formatDistanceToNow(dateToFormat, {
    addSuffix: true,
    locale: vi,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const postItemClass = isSelected ? cx("post-item", "selected") : cx("post-item");
  const navigate = useNavigate();
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileName(file?.name);
  };

  const addEmoji = (emoji) => {
    setCommentValue(commentValue + emoji.native);
  };

  const handleLikePost = async (e, PostID) => {
    e.preventDefault();
    const UserID = user?.UserID;
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/page/like`, 
        { UserID, PostID },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const isLiked = response.data.message === "Liked the post successfully.";
        if (isLiked) {
          setLikes([...likes, { UserID }]);
        } else {
          setLikes(likes.filter(like => like.UserID !== UserID));
        }
      }
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleEditPost = async () => {
    try {
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/page/post/edit/${post.PostID}`, 
        { Content: editPostValue },
        { withCredentials: true }
      );
      if(response.status === 200) {
        dispatchMyPost(updatePost(post.PostID, editPostValue));
        setRefreshTrigger(prev => !prev);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  const handleDeletePost = async (PostID) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/page/post/delete/${PostID}`,
        { withCredentials: true }
      );
      if(response.status === 200) {
        dispatchMyPost(removePost(PostID));
        setRefreshTrigger(prev => !prev);
      }
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleCommentPost = async (e, PostID) => {
    e.preventDefault();
    const UserID = user?.UserID;
    const Content = commentValue;
    const formData = new FormData();
    formData.append("UserID", UserID);
    formData.append("Content", Content);
    formData.append("PostID", PostID);
    const file = document.querySelector("input[type='file']").files[0];
    if (file) {
      formData.append("FileURL", file);
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/page/comment/create`, formData,
        { 
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true
        }
      );
      if (response.status === 200) {
        const newComment = {
          ...response.data,
          CreatedAt: response.data.CreatedAt || new Date().toISOString(),
          UpdatedAt: response.data.UpdatedAt || new Date().toISOString(),
          Replies: []
        };
        dispatch({ type: "ADD_COMMENT", payload: newComment });
        setCommentValue("");
        setFileName("");
        await handleFilterComments(PostID, "latest");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterComments = async (PostID, Type) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/page/comment/filter`,
        { PostID, Type }
      );
      if (response.status === 200) {
        const updateComments = response.data;
        dispatch({ type: "SET_COMMENTS", payload: updateComments });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGetProfile = (UserID, Username) => {
    navigate(`/profile/${UserID}/${Username.toLowerCase().split(" ").join("-")}`);
  };

  const handleEditComment = async (commentId) => {
    try {
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/page/comment/${commentId}/edit`,
        { content: editCommentValue }
      );
      if (response.status === 200) {
        dispatch({
          type: "EDIT_COMMENT",
          payload: { CommentID: commentId, Content: response.data.newContent },
        });
        setEditingCommentId(null);
        setEditCommentValue("");
      }
    } catch (err) {
      console.error("Failed to update comment:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/page/comment/${commentId}/delete`);
      if (response.status === 200) {
        dispatch({ type: "DELETE_COMMENT", payload: commentId });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditToggle = (comment) => {
    if (editingCommentId === comment.CommentID) {
      setEditingCommentId(null);
      setEditCommentValue("");
    } else {
      setEditingCommentId(comment.CommentID);
      setEditCommentValue(comment.Content);
    }
  };

  const handleClick = (filterType) => {
    handleFilterComments(post.PostID, filterType);
    setFilter(filterType);
    if (tippyRef.current) {
      tippyRef.current.hide();
    }
  };

  const handleMyPost = (action) => {
    if(action === "Edit") {
      setIsEditing(true);
    } else if(action === "Delete") {
      handleDeletePost(post.PostID);
    }
    if(tippyRefBox.current) {
      tippyRefBox.current.hide();
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/page/comment/like/${commentId}`, {
        userId: user?.UserID
      });
      if(response.status === 200) {
        console.log("Like comment successfully !");
        await handleFilterComments(post.PostID, "latest");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavigation = () => {
    const currentPath = window.location.pathname;
    const targetPath = `/post/detail/${post.PostID}`;
    if (currentPath !== targetPath) {
      navigate(targetPath);
    }
  };

  useEffect(() => {
    if (post) {
      setLikes(post.Likes || []);
      dispatch({ type: "SET_COMMENTS", payload: post.Comments || [] });
    }
  }, [post]);

  return (
    <div className={postItemClass}>
      <div className={cx("user-post")}>
        <div className={cx("post-left")}>
          <img
            src={post.User.ProfilePictureURL === "default" ? "/imgs/avatar-trang-4.jpg" : `${import.meta.env.VITE_IMG_URL}${post?.User?.ProfilePictureURL}`}
            alt="avatar"
            className={cx("img")}
          />
          <div className="d-flex flex-column ">
            <b
              className="fs-4 fw-bold pb-2"
              onClick={() =>
                handleGetProfile(post?.User?.UserID, post?.User?.Username)
              }
            >
              {post?.User?.Username}
            </b>
            <div className="d-flex align-items-center gap-2">
              <span>{date}</span>
              <PublicIcon className={cx("icon")} />
            </div>
          </div>
        </div>
        <div className={cx("post-right")}>
          <Tippy
            interactive={true}
            trigger="click"
            placement="bottom"
            arrow={false}
            content={
              <div className={cx("select")}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <BookmarkIcon className="text-dark fs-2" />
                  <p className="text-dark fs-4 fw-medium">Save</p>
                </div>
                {user?.UserID === post?.User?.UserID && <>
                  <div className="d-flex align-items-center gap-3 mb-3" onClick={() => handleMyPost("Edit")}>
                    <EditIcon className="text-dark fs-2" />
                    <p className="text-dark fs-4 fw-medium">Edit</p>
                  </div>
                  <div className="d-flex align-items-center gap-3" onClick={() => handleMyPost("Delete")}>
                    <DeleteIcon className="text-dark fs-2" />
                    <p className="text-dark fs-4 fw-medium">Delete</p>
                  </div>
                </>}
              </div>
            }
            onCreate={(instance) => (tippyRefBox.current = instance)}
            className={cx("custom")}
          >
            <MoreHorizIcon className={cx("icon")} />
          </Tippy>
          <CloseIcon className={cx("icon")} />
        </div>
      </div>
      {isEditing ? (
        <div className="d-flex flex-column">
          <textarea
            value={editPostValue}
            onChange={(e) => setEditPostValue(e.target.value)}
            className={cx("text-edit")}
          />
          <button className="btn btn-light fs-5 fw-medium mt-5" onClick={handleEditPost}>Save</button>
          <button className="btn btn-light fs-5 fw-medium mt-3" onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <p className="fs-4 pt-4" onDoubleClick={() => setIsEditing(true)}>{post.Content}</p>
      )}
      {post.ImageURL && (
        <img src={`${import.meta.env.VITE_IMG_URL}${post?.ImageURL}`} alt="post" className={cx("post-img")} />
      )}
      {post.VideoURL && (
        <video controls autoPlay loop className={cx("post-video")}>
          <source src={`${import.meta.env.VITE_IMG_URL}${post?.VideoURL}`} type="video/mp4" />
        </video>
      )}
      <div className="d-flex justify-content-between mt-5" onClick={handleNavigation}>
        <div className="d-flex align-items-center gap-2">
          {likes.length > 0 && (
            <>
              <div className={cx("like")}>
                <ThumbUpIcon className={cx("icon")} />
              </div>
              <strong className="fs-5">{likes.length}</strong>
            </>
          )}
        </div>
        <div className="d-flex align-items-center gap-2">
          {comments.length > 0 && (
            <>
              <strong className="fs-5">{comments.length}</strong>
              <p className="fs-5">comment</p>
            </>
          )}
        </div>
      </div>
      <div className={cx("border")}></div>
      <div className="d-flex justify-content-around align-items-center pt-3">
        <div className={cx("user-box")}>
          <button
            className="d-flex align-items-center gap-3"
            onClick={(e) => handleLikePost(e, post.PostID)}
          >
            <ThumbUpOutlinedIcon
              className="fs-1"
              style={isLikedByCurrentUser ? { color: "var(--primary-color)" } : {}}
            />
            <span
              className="fs-4"
              style={isLikedByCurrentUser ? { color: "var(--primary-color)" } : {}}
            >
              Like
            </span>
          </button>
        </div>
        <div
          className={cx("user-box")}
          onClick={() => handleSelectPost(post.PostID)}
        >
          <ModeCommentOutlinedIcon className="fs-1" />
          <span className="fs-4">Comment</span>
        </div>
        <div className={cx("user-box")}>
          <ShareIcon className="fs-1" />
          <span className="fs-4">Share</span>
        </div>
      </div>
      {isSelected && (
        <>
          <div className={cx("border")}></div>
          <div>
            <Tippy
              interactive={true}
              trigger="click"
              placement="bottom-start"
              arrow={false}
              content={
                <div>
                  <div
                    className="option"
                    onClick={() => handleClick("default")}
                  >
                    <b className="text-black fw-bold">All comment</b>
                    <p className="text-secondary fs-5">Show all comments.</p>
                  </div>
                  <div
                    className="option mt-3"
                    onClick={() => handleClick("latest")}
                  >
                    <b className="text-black fw-bold">Latest</b>
                    <p className="text-secondary fs-5">
                      Displays all comments, in order with the newest comments first.
                    </p>
                  </div>
                </div>
              }
              onCreate={(instance) => (tippyRef.current = instance)}
              className={cx("custom")}
            >
              <div className="d-flex align-items-center pt-3">
                <b className="fs-4 fw-bold">{filter === "default" ? "All comment" : "Latest"}</b>
                <ArrowDropDownIcon className="fs-1" />
              </div>
            </Tippy>
            <div className={cx("user-comment")}>
              <img
                src={user.ProfilePictureURL === "default" ? "/imgs/avatar-trang-4.jpg" : `${import.meta.env.VITE_IMG_URL}${user?.ProfilePictureURL}`}
                alt="avatar"
                className={cx("user-avatar")}
              />
              <form
                className={cx("comment-box")}
                encType="multipart/form-data"
                onSubmit={(e) => handleCommentPost(e, post.PostID)}
              >
                <textarea
                  placeholder="Write a comment..."
                  value={commentValue}
                  onChange={(e) => setCommentValue(e.target.value)}
                />
                <div className={cx("more")}>
                  <div className={cx("upload-container")}>
                    <label
                      htmlFor="file-upload"
                      className={cx("custom-file-upload")}
                    >
                      <CameraAltIcon className="fs-3" />
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      className={cx("file-input")}
                      onChange={handleFileChange}
                    />
                  </div>
                  <Tippy
                    interactive={true}
                    arrow={false}
                    trigger="click"
                    content={<Picker data={data} onEmojiSelect={addEmoji} theme="light" />}
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
            {fileName && (
              <div className={cx("preview")}>
                <p className="fs-4">{fileName}</p>
              </div>
            )}
            <div className={cx("comments")}>
              <RenderedComments
                comments={comments}
                user={user}
                handleEditToggle={handleEditToggle}
                handleEditComment={handleEditComment}
                handleDeleteComment={handleDeleteComment}
                handleLikeComment={handleLikeComment}
                editCommentValue={editCommentValue}
                editingCommentId={editingCommentId}
                setEditCommentValue={setEditCommentValue}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

PostItem.propTypes = {
  post: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  setRefreshTrigger: PropTypes.func,
  handleSelectPost: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default PostItem;