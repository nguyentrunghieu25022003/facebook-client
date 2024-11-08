import { useEffect, useState } from "react";
import axios from "axios";

const useAuthToken = () => {
  const [userToken, setUserToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthToken = async () => {
      setIsLoading(true);
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if(refreshToken) {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/user/auth/check-token`,
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
              withCredentials: true,
            }
          );
          
          if (response.status === 200) {
            console.log("Token is valid", response.data.accessToken);
            setUserToken(true);
          }
        }
      } catch (error) {
        console.error("Error checking tokens", error);
        setUserToken(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthToken();
  }, []);

  return { userToken, isLoading };
};

export default useAuthToken;