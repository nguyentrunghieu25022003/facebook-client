import PropTypes from "prop-types";
import classNames from "classnames/bind";
import styles from "./create-post.module.scss";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addPost } from "../../redux/slices/posts";

const cx = classNames.bind(styles);

const CreatePost = ({ closeModal, setRefreshTrigger }) => {
  const dispatch = useDispatch();
  const [postContent, setPostContent] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.type.split("/")[0];
      const maxSize = 50 * 1024 * 1024;

      if (file.size > maxSize) {
        alert("File size exceeds the 50MB limit.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setFile(file);
      };

      if (fileType === "image" || fileType === "video") {
        reader.readAsDataURL(file);
      }

      setFileName(file.name);
    } else {
      setFile(null);
    }
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("UserID", user.UserID);
    formData.append("Content", postContent);
    const fileType = file?.type;
    if (fileType?.startsWith("image/")) {
      formData.append("PostType", "image");
    } else if (fileType?.startsWith("video/")) {
      formData.append("PostType", "video");
    } else {
      formData.append("PostType", "text");
    }
    if (file) {
      formData.append("FileURL", file);
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/page/post/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        dispatch(addPost(response.data.post));
        setRefreshTrigger((prev) => !prev);
        closeModal();
        setPostContent("");
        setFile(null);
        setFileName("");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const addEmoji = (emoji) => {
    setPostContent((prevContent) => prevContent + emoji.native);
  };

  return (
    <div className={cx("create-post")}>
      <div className="container">
        <div className="row">
          <div className={cx("create-box")}>
            <span
              className="d-flex justify-content-end mb-2"
              onClick={closeModal}
            >
              <CloseIcon className="fs-1" />
            </span>
            <h4 className="text-center fs-1 fw-bold pb-5">Create post</h4>
            <div className={cx("border")}></div>
            <form onSubmit={handleCreatePost}>
              <div className={cx("user")}>
                <img
                  src={
                    user.ProfilePictureURL === "default"
                      ? "/imgs/avatar-trang-4.jpg"
                      : `${import.meta.env.VITE_IMG_URL}${
                          user.ProfilePictureURL
                        }`
                  }
                  alt="avatar"
                  className={cx("avatar")}
                />
                <h6 className="fs-4 fw-bold">{user.Username}</h6>
              </div>
              <textarea
                className="form-control fs-2 fw-normal"
                placeholder="What are you thinking?"
                rows={5}
                cols={45}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />
              <div className="d-flex align-items-center justify-content-between pt-4 pb-2">
                <div className="d-flex align-items-center gap-2">
                  <b className="fs-4 fw-medium">Add to your article</b>
                  <div>
                    <input
                      type="file"
                      id="file-upload"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                      accept="image/*,video/*"
                    />
                    <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
                      <AttachFileIcon className="fs-2" />
                    </label>
                  </div>
                </div>
                <div>
                  <Tippy
                    interactive={true}
                    arrow={false}
                    trigger="click"
                    content={
                      <Picker
                        data={data}
                        onEmojiSelect={(emoji) => addEmoji(emoji, postContent)}
                        theme="light"
                      />
                    }
                    className={cx("custom")}
                    placement="right"
                  >
                    <EmojiEmotionsIcon className="fs-2" />
                  </Tippy>
                </div>
              </div>
              {fileName && <div className="fs-4">{fileName}</div>}
              <button
                type="submit"
                className="btn btn-primary w-100 fs-3 fw-bold mt-5"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

CreatePost.propTypes = {
  closeModal: PropTypes.func.isRequired,
  setRefreshTrigger: PropTypes.func.isRequired,
};

export default CreatePost;
