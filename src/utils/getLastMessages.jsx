import { useState, useEffect, useCallback } from "react";

const useFetchMessages = (user, fetchLastMessage) => {
  const [countMessages, setCountMessages] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetchLastMessage(user?.UserID);
      const sendersSet = new Set();
      response?.forEach((message) => {
        sendersSet.add(message.SenderID);
      });
      console.log("Fetched messages", sendersSet);
      setCountMessages(sendersSet.size);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } 
  }, [user?.UserID, fetchLastMessage]);

  useEffect(() => {
    if (isRefreshing) {
      fetchMessages().finally(() => setIsRefreshing(false));
    }
  }, [isRefreshing, fetchMessages]);

  return { countMessages, setCountMessages, setIsRefreshing, fetchMessages };
};

export default useFetchMessages;
