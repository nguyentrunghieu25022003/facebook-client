import PropTypes from "prop-types";
import classNames from "classnames/bind";
import styles from "./chat-bubble.module.scss";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllMessages } from "../../api/index";
import { useEffect } from "react";
import { formatTime } from "../../utils/date";
import { useSocket } from "../../utils/socket";

const cx = classNames.bind(styles);

const ChatBubble = ({ friend }) => {
  const dispatch = useDispatch();
  const UserID = JSON.parse(localStorage.getItem("user"))?.UserID;
  const key = [UserID, friend.UserID].sort().join("-");
  const messages = useSelector((state) => state.messages.chatBoxer[key] || []);
  const socket = useSocket();

  useEffect(() => {
    dispatch(fetchAllMessages({ senderId: UserID, receiverId: friend.UserID }));
  }, [UserID, friend.UserID, dispatch]);

  useEffect(() => {
    if(socket) {
      const handleNewMessage = () => {
        dispatch(fetchAllMessages({ senderId: UserID, receiverId: friend.UserID }));
      };
  
      const handleMessageRead = () => {
        dispatch(fetchAllMessages({ senderId: UserID, receiverId: friend.UserID }));
      };
  
      socket.on("newMessage", handleNewMessage);
      socket.on("messageRead", handleMessageRead);

      return () => {
        socket.off("newMessage", handleNewMessage);
        socket.off("messageRead", handleMessageRead);
      };
    }
  }, [socket, dispatch, UserID, friend.UserID]);

  return (
    <>
      {messages.length > 0 ? (
        <div className={cx("chat-bubble")}>
          <p className="text-dark fs-5">{messages[messages?.length - 1]?.SenderID === UserID && <b>You: </b>}{messages[messages?.length - 1].Content}</p>
          <span className="text-dark fs-5">{formatTime(messages[messages?.length - 1].CreatedAt)}</span>
        </div>
      ) : (
        <p className="text-dark fs-5">You are now connected on Messenger</p>
      )}
    </>
  );
};

ChatBubble.propTypes = {
  friend: PropTypes.object.isRequired,
};

export default ChatBubble;