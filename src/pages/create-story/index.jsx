import classNames from "classnames/bind";
import styles from "./create-story.module.scss";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import axios from "axios";
import { useState } from "react";
import { Button, TextField, IconButton } from "@mui/material";
import { AttachFile } from "@mui/icons-material";

const cx = classNames.bind(styles);

const CreateStory = () => {
  const [storyContent, setStoryContent] = useState("");
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

  const handleCreateStory = async (event) => {
    if(!storyContent) {
      return;
    }
    event.preventDefault();
    const formData = new FormData();
    formData.append("UserID", user?.UserID);
    formData.append("Content", storyContent);
    if (file) {
      formData.append("FileURL", file);
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/page/story/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        console.log("Success !");
        setStoryContent("");
        setFile(null);
        setFileName("");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const addEmoji = (emoji) => {
    setStoryContent((prevContent) => prevContent + emoji.native);
  };

  return (
    <div className={cx("create-story")}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h3 className="fs-1 fw-medium text-center mb-5">Create My Story</h3>
            <div className={cx("story-container")}>
              <div className="d-flex gap-3">
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
                  style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                />
                <div className="w-100">
                  <TextField
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="What's on your mind?"
                    className={cx("input-field")}
                    sx={{
                      "& .MuiInputBase-input": {
                        fontSize: "1.7rem",
                        lineHeight: "1.4"
                      },
                    }}
                    required
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                  />
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-end gap-5 mt-3">
                <div className="d-flex align-items-center gap-3">
                  <Tippy arrow={true}>
                    <IconButton component="label">
                      <AttachFile />
                      <input
                        type="file"
                        accept="image/*,video/*"
                        hidden
                        onChange={handleFileChange}
                      />
                    </IconButton>
                  </Tippy>
                  <Tippy
                    interactive={true}
                    arrow={false}
                    trigger="click"
                    content={
                      <Picker
                        data={data}
                        onEmojiSelect={(emoji) => addEmoji(emoji, storyContent)}
                        theme="light"
                      />
                    }
                    className={cx("custom")}
                    placement="right"
                  >
                    <EmojiEmotionsIcon className="fs-2" />
                  </Tippy>
                </div>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ fontSize: "1.4rem", padding: "10px 20px" }}
                  onClick={(e) => handleCreateStory(e)}
                >
                  Post
                </Button>
              </div>
              {fileName && (
                <div className="mt-3">
                  <p>Selected File: {fileName}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStory;