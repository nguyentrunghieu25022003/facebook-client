import classNames from "classnames/bind";
import styles from "./header.module.scss";
import axios from "axios";
import debounce from "lodash.debounce";
import {
  FacebookOutlinedIcon,
  SearchIcon,
  HomeIcon,
  PeopleOutlineIcon,
  OndemandVideoIcon,
  StorefrontIcon,
  GroupsIcon,
  AppsRoundedIcon,
  ChatBubbleIcon,
  NotificationsIcon,
  SettingsIcon,
  HelpIcon,
  ReportIcon,
  LogoutIcon,
  MoreHorizIcon,
  FullscreenExitIcon,
  EditNoteIcon,
} from "../../icons/header.jsx";
import { Link } from "react-router-dom";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllNotification, fetchAllFriendsList, fetchLastMessage } from "../../api/index";
import ChatBubble from "../chat-bubble/index";
import ChatBox from "../chat/index.jsx";
import { useSocket } from "../../utils/socket";
import { formatDate } from "../../utils/date";
import useFetchMessages from "../../utils/getLastMessages.jsx";

const cx = classNames.bind(styles);

const Header = () => {
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("user"));
  const [users, setUsers] = useState([]);
  const { setIsRefreshing, countMessages, fetchMessages } = useFetchMessages(user, fetchLastMessage);
  const [isActive, setIsActive] = useState(JSON.parse(localStorage.getItem("isActive")));
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [countNotifications, setCountNotifications] = useState(0);
  const friendsState = useSelector((state) => state.friends);
  const allFriends = friendsState.items?.ReceivedFriends?.concat(friendsState.items?.RequestedFriends) || [];
  const socket = useSocket();

  const handleSearch = debounce(async (userName) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/page/search`, {
        Username: userName
      });
      if (response.status === 200) {
        setUsers(response.data);
      }
    } catch (err) {
      console.log("Error" + err.message);
    }
  }, 300);
  
  const onChange = (e) => {
    const value = e.target.value;
    if (value) {
      handleSearch(value);
    }
  };
  
  useEffect(() => {
    fetchMessages();

    if (socket) {
      socket.on("countMessages", (message) => {
        if (message) {
          setIsRefreshing(true);
        }
        console.log("countMessages")
      });

      socket.on("like", async () => {
        const response = await fetchAllNotification(user.UserID);
        setNotifications(response.notifications);
        setCountNotifications(response.countNotifications);
      });

      socket.on("addedPost", async () => {
        const response = await fetchAllNotification(user.UserID);
        setNotifications(response.notifications);
        setCountNotifications(response.countNotifications);
      });

      socket.on("statusPost", async () => {
        const response = await fetchAllNotification(user.UserID);
        setNotifications(response.notifications);
        setCountNotifications(response.countNotifications);
      });

      socket.on("commentedPost", async () => {
        const response = await fetchAllNotification(user.UserID);
        setNotifications(response.notifications);
        setCountNotifications(response.countNotifications);
      });
    }

    return () => {
      socket.off("countMessages");
      socket.off("like");
      socket.off("addedPost");
      socket.off("statusPost");
      socket.off("commentedPost");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, user?.UserID]);

  const handleLogout = async (event) => {
    event.preventDefault();
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/auth/${user.UserID}/log-out`, {
        refreshToken: refreshToken
      });

      if(response.status === 200) {
        console.log("Logout success !");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setTimeout(() => {
          window.location.href = "/auth";
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openChatBox = (friend) => {
    if (!selectedFriends.find(f => f.UserID === friend.UserID)) {
      if (selectedFriends.length === 2) {
        setSelectedFriends((prev) => [...prev.slice(1), friend]);
      } else {
        setSelectedFriends([...selectedFriends, friend]);
      }
    }
  };

  const closeChatBox = (friendId) => {
    setSelectedFriends(selectedFriends.filter(f => f.UserID !== friendId));
  };

  useEffect(() => {
    (async () => {
      const response = await fetchAllNotification(user.UserID);
      setNotifications(response.notifications);
      setCountNotifications(response.countNotifications);
    })();
  }, [user?.UserID]);

  useEffect(() => {
    dispatch(fetchAllFriendsList(user.UserID));
  }, [dispatch, user?.UserID]);

  useEffect(() => {
    localStorage.setItem("isActive", JSON.stringify(isActive));
  }, [isActive]);

  return (
    <header className={cx("header")}>
      <div className="container">
        <div className="row">
          <div className="col-xl-12 col-md-12 col-sm-12 col-12">
            <div className="d-flex align-items-center justify-content-between">
              <div
                className="d-flex align-items-center gap-2"
                id={cx("header-left")}
              >
                <Link to="/">
                  <FacebookOutlinedIcon className={cx("icon")} />
                </Link>
                <Tippy
                  interactive={true}
                  arrow={false}
                  trigger="click"
                  placement="bottom"
                  content={
                    <div style={{ minWidth: "300px"}}>
                      <ul>
                        {users.map((user, index) => {
                          return (
                            <li key={index}>
                              <Link className="text-decoration-none d-flex align-items-center gap-3" to={`/profile/${user?.UserID}/${user?.Username?.toLowerCase().split(" ").join("-")}`}>
                                <img
                                  src={user.ProfilePictureURL === "default" ? "/imgs/avatar-trang-4.jpg" : `${import.meta.env.VITE_IMG_URL}${user?.ProfilePictureURL}`}
                                  alt="avatar"
                                  className={cx("avatar")}
                                />
                                <span className="fs-4 fw-medium text-dark">{user.Username}</span>
                              </Link>
                            </li>
                          );
                        })}
                        {users.length === 0 && <strong className="fs-4 text-dark fw-medium">Search history is empty</strong>}
                      </ul>
                    </div>
                  }
                  maxWidth="350px"
                  className={cx("custom")}
                >
                  <form className="d-flex align-items-center">
                    <button className="btn" type="submit">
                      <SearchIcon className={cx("icon")} />
                    </button>
                    <input
                      type="search"
                      name="Username"
                      className="fs-4"
                      placeholder="Search on facebook"
                      onChange={onChange}
                    />
                  </form>
                </Tippy>
              </div>
              <div
                className="d-flex align-items-center gap-5"
                id={cx("header-center")}
              >
                <div className={cx("navigation-item")}>
                  <Link
                    to="/"
                    onClick={() => setIsActive("home")}
                    className={isActive === "home" ? cx("active") : ""}
                  >
                    <HomeIcon className={cx("icon")} />
                  </Link>
                </div>
                <div className={cx("navigation-item")}>
                  <Link
                    to="/friends"
                    onClick={() => setIsActive("friends")}
                    className={isActive === "friends" ? cx("active") : ""}
                  >
                    <PeopleOutlineIcon className={cx("icon")} />
                  </Link>
                </div>
                <div className={cx("navigation-item")}>
                  <Link
                    to="/watch"
                    onClick={() => setIsActive("watch")}
                    className={isActive === "watch" ? cx("active") : ""}
                  >
                    <OndemandVideoIcon className={cx("icon")} />
                  </Link>
                </div>
                <div className={cx("navigation-item")}>
                  <Link
                    to="/market"
                    onClick={() => setIsActive("market")}
                    className={isActive === "market" ? cx("active") : ""}
                  >
                    <StorefrontIcon className={cx("icon")} />
                  </Link>
                </div>
                <div className={cx("navigation-item")}>
                  <Link
                    to="/group"
                    onClick={() => setIsActive("group")}
                    className={isActive === "group" ? "active" : ""}
                  >
                    <GroupsIcon className={cx("icon")} />
                  </Link>
                </div>
              </div>
              <div
                className="d-flex align-items-center gap-3"
                id={cx("header-right")}
              >
                <Tippy
                  interactive={true}
                  placement="bottom"
                  arrow={false}
                  trigger="click"
                  content={<div>Menu</div>}
                >
                  <div className={cx("circle")}>
                    <AppsRoundedIcon className={cx("icon")} />
                  </div>
                </Tippy>
                <Tippy
                  interactive={true}
                  placement="bottom"
                  arrow={false}
                  trigger="click"
                  content={
                    <div>
                      <div className={cx("message-header")}>
                        <div className="d-flex align-items-center justify-content-between">
                          <h5 className="fs-1 fw-bold text-dark">Chats</h5>
                          <div className="d-flex align-items-center gap-4">
                            <MoreHorizIcon className="fs-1 text-secondary" />
                            <FullscreenExitIcon className="fs-1 text-secondary" />
                            <EditNoteIcon className="fs-1 text-secondary" />
                          </div>
                        </div>
                        <form className={cx("search-chat")}>
                          <button type="submit">
                            <SearchIcon className="fs-1 text-secondary" />
                          </button>
                          <input type="search" placeholder="Search..." />
                        </form>
                      </div>
                      <div className={cx("message-list")}>
                        {allFriends.map((friend, index) => (
                          <div
                            key={index}
                            className="d-flex align-items-center gap-3 pt-3 pb-3"
                            onClick={() => openChatBox(friend)}
                          >
                            <img
                              src={
                                friend?.ProfilePictureURL === "default"
                                  ? "/imgs/avatar-trang-4.jpg"
                                  : `${import.meta.env.VITE_IMG_URL}${
                                      friend?.ProfilePictureURL
                                    }`
                              }
                              alt="avatar"
                              className={cx("avatar")}
                            />
                            <div>
                              <h6 className="fs-4 fw-medium text-dark">
                                {friend?.Username}
                              </h6>
                              <ChatBubble friend={friend} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className={cx("border")}></div>
                      <Link className="fs-4 fw-medium d-block text-center text-decoration-none">
                        See it all in Messenger
                      </Link>
                    </div>
                  }
                  className={cx("custom-chat")}
                  maxWidth={500}
                >
                  <div className={cx("circle")} id={cx("chat")}>
                    {countMessages > 0 && (
                      <div className={cx("circle-number")}>{countMessages}</div>
                    )}
                    <ChatBubbleIcon className={cx("icon")} />
                  </div>
                </Tippy>
                <Tippy
                  interactive={true}
                  placement="bottom"
                  arrow={false}
                  trigger="click"
                  content={
                    <div className={cx("table-custom")}>
                      <div className="d-flex align-items-center justify-content-between">
                        <h5 className={cx("notification-heading")}>
                          Notification
                        </h5>
                        <Tippy>
                          <MoreHorizIcon className="fs-1 text-secondary" />
                        </Tippy>
                      </div>
                      <div className={cx("notifications")}>
                        {notifications.map((notification, index) => (
                          <div
                            key={index}
                            className="d-flex align-items-center justify-content-between gap-3"
                          >
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={
                                  notification?.User?.ProfilePictureURL ===
                                  "default"
                                    ? "/imgs/avatar-trang-4.jpg"
                                    : `${import.meta.env.VITE_IMG_URL}${
                                        notification?.User?.ProfilePictureURL
                                      }`
                                }
                                alt="avatar"
                                className={cx("avatar")}
                              />
                              <div>
                                <p className="fs-4 fw-normal text-dark">
                                  {notification?.Message}
                                </p>
                                <b className="fs-4 fw-medium text-dark">
                                  {formatDate(notification?.CreatedAt)}
                                </b>
                              </div>
                            </div>
                            <div className={cx("notification-circle")}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  }
                  className={cx("custom-chat")}
                >
                  <div className={cx("circle")} id={cx("notifications")}>
                    {countNotifications > 0 && (
                      <div className={cx("circle-number")}>
                        {countNotifications}
                      </div>
                    )}
                    <NotificationsIcon className={cx("icon")} />
                  </div>
                </Tippy>
                <Tippy
                  interactive={true}
                  placement="bottom"
                  arrow={false}
                  trigger="click"
                  content={
                    <div className={cx("account-setting")}>
                      <Link
                        to={`/profile/${
                          user?.UserID
                        }/${user?.Username?.toLowerCase()
                          .split(" ")
                          .join("-")}`}
                        className={cx("user-link")}
                      >
                        <img
                          src={
                            user?.ProfilePictureURL === "default"
                              ? "/imgs/avatar-trang-4.jpg"
                              : `${import.meta.env.VITE_IMG_URL}${
                                  user?.ProfilePictureURL
                                }`
                          }
                          alt="avatar"
                          className={cx("avatar")}
                        />
                        <b className="text-dark fs-4 fw-bold">
                          {user?.Username}
                        </b>
                      </Link>
                      <div className={cx("border")}></div>
                      <div className={cx("icon-box")}>
                        <Link className="d-flex align-items-center gap-4 pt-3 pr-3 pb-3 pl-3">
                          <span>
                            <SettingsIcon className="fs-1" />
                          </span>
                          <strong className="fw-bold">
                            Settings & privacy
                          </strong>
                        </Link>
                      </div>
                      <div className={cx("icon-box")}>
                        <Link className="d-flex align-items-center gap-4 pt-3 pr-3 pb-3 pl-3">
                          <span>
                            <HelpIcon className="fs-1" />
                          </span>
                          <strong className="fw-bold">Help & support</strong>
                        </Link>
                      </div>
                      <div className={cx("icon-box")}>
                        <Link className="d-flex align-items-center gap-4 pt-3 pr-3 pb-3 pl-3">
                          <span>
                            <ReportIcon className="fs-1" />
                          </span>
                          <strong className="fw-bold">
                            Contribute comments
                          </strong>
                        </Link>
                      </div>
                      <div className={cx("icon-box")}>
                        <button
                          className="d-flex align-items-center gap-4 pt-3 pr-3 pb-3 pl-3"
                          onClick={handleLogout}
                        >
                          <span>
                            <LogoutIcon className="fs-1" />
                          </span>
                          <strong className="fw-bold">Logout</strong>
                        </button>
                      </div>
                      <ul
                        className="d-flex flex-wrap gap-4 ml-3"
                        style={{ margin: "5px 0 0 25px" }}
                      >
                        <li className="fs-5 fw-normal text-secondary d-flex align-items-center gap-3">
                          Privacy<span className="d-block">·</span>
                        </li>
                        <li className="fs-5 fw-normal text-secondary d-flex align-items-center gap-3">
                          Terms<span className="d-block">·</span>
                        </li>
                        <li className="fs-5 fw-normal text-secondary d-flex align-items-center gap-3">
                          Ads<span className="d-block">·</span>
                        </li>
                        <li className="fs-5 fw-normal text-secondary d-flex align-items-center gap-3">
                          Ad choices<span className="d-block">·</span>
                        </li>
                        <li className="fs-5 fw-normal text-secondary d-flex align-items-center gap-3">
                          Cookie<span className="d-block">·</span>
                        </li>
                        <li className="fs-5 fw-normal text-secondary d-flex align-items-center gap-3">
                          See more<span className="d-block">·</span>
                        </li>
                        <li className="fs-5 fw-normal text-secondary">
                          Meta © 2024
                        </li>
                      </ul>
                    </div>
                  }
                  className={cx("custom")}
                >
                  <img
                    src={
                      user?.ProfilePictureURL === "default"
                        ? "/imgs/avatar-trang-4.jpg"
                        : `${import.meta.env.VITE_IMG_URL}${
                            user?.ProfilePictureURL
                          }`
                    }
                    alt="avatar"
                    className={cx("avatar")}
                  />
                </Tippy>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <div className={cx("chat-list")}>
              {selectedFriends.map((friend) => (
                <ChatBox
                  key={friend.UserID}
                  friend={friend}
                  closeChatBox={closeChatBox}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
