import PropTypes from "prop-types";
import classNames from "classnames/bind";
import styles from "./chat.module.scss";
import axios from "axios";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import VideocamIcon from "@mui/icons-material/Videocam";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SendIcon from "@mui/icons-material/Send";
import { useSocket } from "../../utils/socket";
import MediaRecorder from "../../components/media-recorder/index";
import { formatDate, formatTime, shouldDisplayTime } from "../../utils/date";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllMessages, fetchLastMessage } from "../../api/index";
import { Link } from "react-router-dom";
import { addMessage, readMessage } from "../../redux/slices/messages";
import useFetchMessages from "../../utils/getLastMessages.jsx";

const cx = classNames.bind(styles);

const ChatBox = ({ friend, closeChatBox }) => {
  const dispatch = useDispatch();
  const [friendStatus, setFriendStatus] = useState("");
  const [isMinimized, setIsMinimized] = useState(true);
  const [messageValue, setMessageValue] = useState("");
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [image, setImage] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const UserID = user?.UserID;
  const key = [UserID, friend.UserID].sort().join("-");
  const messagesState = useSelector((state) => state.messages.chatBoxer[key]);
  const [messages, setMessages] = useState(messagesState);
  const socket = useSocket();
  const [otherUserIsTyping, setOtherUserIsTyping] = useState(0);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { fetchMessages } = useFetchMessages(user, fetchLastMessage);
  
  useEffect(() => {
    if (socket) {
      socket.off("newMessage");
      socket.off("typing");
      socket.off("messageRead");

      socket.on("newMessage", (message) => {
        if (message.ReceiverID === friend.UserID || message.SenderID === friend.UserID) {
          dispatch(addMessage(message));
        }
        setTimeout(() => {
          fetchMessages();
        }, 2000);
      });

      socket.on("typing", (data) => {
        if (data.receiverId === UserID) {
          setOtherUserIsTyping(data.receiverId);
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setOtherUserIsTyping(0);
          }, 3000);
        }
      });
      
      socket.on("messageRead", (data) => {
        dispatch(readMessage({ SenderID: data.senderId, ReceiverID: data.receiverId }));
        setTimeout(() => {
          fetchMessages();
        }, 2000);
      });

      socket.on("friend:status", ({ userId, userStatus }) => {
        console.log("Friend status in ChatBox received:", { userId, userStatus });
        if (friend.UserID === userId) {
          setFriendStatus(userStatus);
        }
      });

      return () => {
        if(socket) {
          socket.off("newMessage");
          socket.off("typing");
          socket.off("messageRead");
          socket.off("friend:status");
        }
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, friend.UserID, UserID, dispatch]);

  const sendMessage = (message) => {
    if (socket) {
      socket.emit("sendMessage", message);
    } else {
      console.error("Socket not available");
    }
  };

  const handleReadMessage = async (friendId) => {
    try {
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/message/${UserID}/${friendId}/read/${messagesState[messagesState.length - 1]?.MessageID}`);
      if(response.status === 200) {
        console.log("Read message successfully !");
        dispatch(fetchAllMessages({ senderId: UserID, receiverId: friend.UserID }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendTypingNotificationToServer = () => {
    if (socket && !isTyping) {
      setIsTyping(true);
      socket.emit("typing", { senderId: UserID, receiverId: friend.UserID });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const addEmoji = (emoji) => {
    setMessageValue(messageValue + emoji.native);
  };

  const handleSendMessage = async (senderId, receiverId) => {
    const Content = messageValue;
    const formData = new FormData();
    formData.append("Content", Content);
    const imageFile = document.querySelector("input[type='file']")?.files[0];
    if (imageFile) {
      formData.append("ImageURL", imageFile);
    }
    if (audioBlob) {
      formData.append("AudioURL", audioBlob);
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/message/${senderId}/send/${receiverId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        sendMessage(response.data.newMessage);
        setMessageValue("");
        setImage(null);
        scrollToBottom();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleKeyPress = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingNotificationToServer();
    }
  };

  useEffect(() => {
    if (!messagesState || !messagesState[key]) {
      dispatch(
        fetchAllMessages({ senderId: UserID, receiverId: friend.UserID })
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [UserID, friend.UserID, dispatch]);

  useEffect(() => {
    setMessages(messagesState);
    scrollToBottom();
  }, [messagesState]);

  useEffect(() => {
    if (!isMinimized) {
      scrollToBottom();
    }
  }, [isMinimized]);

  useEffect(() => {
    const typingTimeout = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
      }
    }, 2000);
    return () => clearTimeout(typingTimeout);
  }, [isTyping]);

  return (
    <div className={cx("chat-box")}>
      <div className={cx("wrapper")}>
        <div className={cx("card-header")}>
          <div className="d-flex align-items-center gap-3">
            <img
              src={friend.ProfilePictureURL === "default" ? "/imgs/avatar-trang-4.jpg" : `${import.meta.env.VITE_IMG_URL}${friend.ProfilePictureURL}`}
              alt="Avatar"
              className={cx("avatar")}
            />
            <div>
              <h6 className="fs-4 fw-bold">{friend.Username}</h6>
              <b className="fs-5 fw-normal text-secondary">{friendStatus}</b>
            </div>
            <span onClick={toggleMinimize}>
              {!isMinimized ? (
                <KeyboardArrowUpIcon className="fs-1 text-primary" />
              ) : (
                <KeyboardArrowDownIcon className="fs-1 text-primary" />
              )}
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Link to={`/video-call/friend/${friend.UserID}`}>
              <VideocamIcon className="fs-1 text-primary" />
            </Link>
            <span onClick={() => closeChatBox(friend.UserID)}>
              <CloseIcon className="fs-1 text-secondary" />
            </span>
          </div>
        </div>
        {isMinimized && (
          <div>
            <div className={cx("card-body")}>
              {messages?.length > 0 &&
                messages.map((message, index) => {
                  let createdAt = formatDate(message.CreatedAt);
                  let timeCreatedAt = message.CreatedAt;
                  if (index > 0) {
                    const prevCreatedAt = formatDate(
                      messages[index - 1].CreatedAt
                    );
                    if (createdAt === prevCreatedAt) {
                      createdAt = "";
                    }
                    const prevMessageTime = messages[index - 1].CreatedAt;
                    if (!shouldDisplayTime(timeCreatedAt, prevMessageTime)) {
                      timeCreatedAt = "";
                    }
                  }
                  return (
                    <div
                      key={message.MessageID}
                      className="mt-4"
                      ref={index === messages.length - 1 ? messagesEndRef : null}
                    >
                      {message.SenderID === UserID ? (
                        <div className="mt-4">
                          {(createdAt || timeCreatedAt) && (
                            <p className="fs-5 fw-normal text-center mb-4">
                              {formatTime(timeCreatedAt)}{" "}
                              {createdAt ? ", " + createdAt : ""}
                            </p>
                          )}
                          <div className="d-flex justify-content-end">
                            {message.ImageURL || message.AudioURL ? (
                              <div className={cx("multimedia")}>
                                {message.ImageURL && (
                                  <img
                                    src={`${import.meta.env.VITE_IMG_URL}${message.ImageURL}`}
                                    alt="img"
                                    style={{
                                      maxWidth: "100%",
                                      maxHeight: "100px",
                                    }}
                                  />
                                )}
                                {message.AudioURL && (
                                  <audio
                                    src={`${import.meta.env.VITE_IMG_URL}${message.AudioURL}`}
                                    controls
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="d-flex flex-column">
                                <div className={cx("message-wrapper")}>
                                  <div className={cx("sender-box")}>
                                    <p className="fs-4 text-white">
                                      {message.Content}
                                    </p>
                                  </div>
                                  <Tippy
                                    interactive={true}
                                    placement="bottom-end"
                                    trigger="click"
                                    arrow={false}
                                    content={<div><b className="fs-5 fw-medium text-dark">Remove this message</b></div>}
                                    className={cx("custom-message-container")}
                                  >
                                    <MoreHorizIcon className={cx("more-icon", "fs-1", "text-secondary")} />
                                  </Tippy>
                                </div>
                                { index === messages.length - 1 && <b className="fs-5 text-dark mt-2 text-center">{message.IsRead ? "Read" : "Unread"}</b> }
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <p className="fs-5 fw-normal text-center mb-4">
                            {createdAt}
                          </p>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={friend.ProfilePictureURL === "default" ? "/imgs/avatar-trang-4.jpg" : `${import.meta.env.VITE_IMG_URL}${friend.ProfilePictureURL}`}
                              alt="avatar"
                              className={cx("avatar")}
                            />
                            {message.ImageURL || message.AudioURL ? (
                              <div className={cx("multimedia")}>
                                {message.ImageURL && (
                                  <img
                                    src={`${import.meta.env.VITE_IMG_URL}${message.ImageURL}`}
                                    alt="img"
                                    style={{
                                      maxWidth: "100%",
                                      maxHeight: "100px",
                                    }}
                                  />
                                )}
                                {message.AudioURL && (
                                  <audio
                                    src={`${import.meta.env.VITE_IMG_URL}${message.AudioURL}`}
                                    controls
                                  />
                                )}
                              </div>
                            ) : (
                              <div className={cx("receiver-box")}>
                                <p className="fs-4 text-dark">
                                  {message.Content}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  );
                })}
              {otherUserIsTyping === UserID && (
                <div className="d-flex align-items-center gap-3 mt-4">
                  <img
                    src={friend.ProfilePictureURL === "default" ? "/imgs/avatar-trang-4.jpg" : `${import.meta.env.VITE_IMG_URL}${friend.ProfilePictureURL}`}
                    alt="avatar"
                    className={cx("avatar")}
                  />
                  <div className={cx("typing-box")}>
                    <img
                      src="/imgs/07-57-40-974_512.webp"
                      alt="loading"
                      className={cx("typing-img")}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className={cx("card-user")}>
              <MediaRecorder
                audioBlob={audioBlob}
                setAudioBlob={setAudioBlob}
                isAudioActive={isAudioActive}
                setIsAudioActive={setIsAudioActive}
              />
              {!isAudioActive && (
                <span onClick={triggerFileInput}>
                  <AttachFileIcon className="fs-1 text-dark" />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                    accept="image/*"
                  />
                </span>
              )}
              {!isAudioActive && (
                <div className={cx("textarea-container")}>
                  <div>
                    <textarea
                      value={messageValue}
                      className="fs-4 text-dark"
                      rows="1"
                      placeholder="Type a message..."
                      onChange={(e) => {
                        setMessageValue(e.target.value);
                        handleKeyPress();
                      }}
                      onClick={() => handleReadMessage(friend.UserID)}
                    />
                    {image && (
                      <div className={cx("image-preview")}>
                        <img
                          src={image}
                          alt="Uploaded"
                          style={{ maxWidth: "100%", maxHeight: "100px" }}
                        />
                      </div>
                    )}
                  </div>
                  <Tippy
                    interactive={true}
                    arrow={false}
                    trigger="click"
                    content={
                      <Picker
                        data={data}
                        onEmojiSelect={addEmoji}
                        theme="light"
                      />
                    }
                    className={cx("custom")}
                  >
                    <EmojiEmotionsIcon className="emoji-icon fs-2 text-dark" />
                  </Tippy>
                </div>
              )}
              <span onClick={() => handleSendMessage(UserID, friend.UserID)}>
                <SendIcon className="fs-1 text-dark" />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ChatBox.propTypes = {
  friend: PropTypes.object.isRequired,
  closeChatBox: PropTypes.func.isRequired,
};

export default ChatBox;
