export const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const shouldDisplayTime = (currentMessageTime, previousMessageTime) => {
  if (!previousMessageTime) {
    return true;
  }
  
  const currentTime = new Date(currentMessageTime);
  const previousTime = new Date(previousMessageTime);
  
  const timeDifference = currentTime - previousTime;

  const tenMinutes = 10 * 60 * 1000;
  
  return timeDifference > tenMinutes;
};
