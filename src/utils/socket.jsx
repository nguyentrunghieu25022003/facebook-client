import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import useFetchMessages from "./getLastMessages";
import { fetchLastMessage } from "../api/index";

const SocketContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const callerUserId = user?.UserID;
  const { fetchMessages } = useFetchMessages(user, fetchLastMessage);

  useEffect(() => {
    if (callerUserId) {
      const socketInstance = io(import.meta.env.VITE_IMG_URL, {
        transports: ["websocket"],
      });

      socketInstance.on("connect", () => {
        socketInstance.emit("joinRoom", { callerUserId });
        socketInstance.emit("user:action", { userId: callerUserId, userStatus: "Online" });
        socketInstance.on("me", (id) => sessionStorage.setItem("id", id));
      });

      socketInstance.on("connect_error", (err) => {
        console.log("Connection Error:", err.message);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.emit("user:action", { userId: callerUserId, userStatus: "Offline" });
        socketInstance.disconnect();
      };
    }
  }, [callerUserId, fetchMessages]);

  if (!socket) {
    console.log("Socket not available yet, waiting for connection...");
  }

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
