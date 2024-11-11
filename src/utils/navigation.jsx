import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const HandleReloading = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const lastPath = sessionStorage.getItem("lastPath");
    if (lastPath && lastPath !== location.pathname) {
      navigate(lastPath, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = sessionStorage.getItem("lastPath");
    if (!lastPath || (lastPath && lastPath !== currentPath)) {
      sessionStorage.setItem("lastPath", currentPath);
    }
  }, [location.pathname]);
  return null;
};

export default HandleReloading;