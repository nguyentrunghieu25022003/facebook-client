import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const callerUserId = JSON.parse(localStorage.getItem("user"))?.UserID;

  useEffect(() => {
    if (callerUserId) {
      const socketInstance = io(import.meta.env.VITE_IMG_URL, {
        transports: ["websocket"],
      });

      socketInstance.on("connect", () => {
        console.log("Connected to socket server!");
        socketInstance.emit("joinRoom", { callerUserId });
      });

      socketInstance.on("connect_error", (err) => {
        console.log("Connection Error:", err.message);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [callerUserId]);

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
