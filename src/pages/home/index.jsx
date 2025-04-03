import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./home.module.scss";
import {
  fetchAllPosts,
  fetchAllFriendsList,
  fetchAllStories,
} from "../../api/index";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ImageIcon from "@mui/icons-material/Image";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PostItem from "../../components/post/index";
import Modal from "react-modal";
import CreatePost from "../create-post/index";
import ChatBox from "../../components/chat/index";

const cx = classNames.bind(styles);

const Home = () => {
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [stories, setStories] = useState([]);
  const dispatch = useDispatch();
  const friendsState = useSelector((state) => state.friends);
  const postsState = useSelector((state) => state.posts);
  const allFriends =
    friendsState.items?.ReceivedFriends?.concat(
      friendsState.items?.RequestedFriends
    ) || [];
  const posts = postsState.items || [];
  const user = JSON.parse(localStorage.getItem("user"));
  const storyContainerRef = useRef(null);

  const handleSelectPost = (postId) => {
    setSelectedPostId(postId === selectedPostId ? null : postId);
  };

  const openModal = (event) => {
    if (event) {
      event.preventDefault();
    }
    setModalIsOpen(true);
  };

  const closeModal = (event) => {
    if (event) {
      event.preventDefault();
    }
    setModalIsOpen(false);
  };

  const openChatBox = (friend) => {
    if (!selectedFriends.find((f) => f.UserID === friend.UserID)) {
      if (selectedFriends.length === 2) {
        setSelectedFriends((prev) => [...prev.slice(1), friend]);
      } else {
        setSelectedFriends([...selectedFriends, friend]);
      }
    }
  };

  const closeChatBox = (friendId) => {
    setSelectedFriends(selectedFriends.filter((f) => f.UserID !== friendId));
  };

  const getMyStories = async () => {
    try {
      const response = await fetchAllStories(user?.UserID);
      const friendsStory = response?.RequestedFriends;
      setStories(friendsStory);
    } catch (err) {
      console.log("Error: " + err.message);
    }
  };

  const handleScroll = (direction) => {
    const container = storyContainerRef.current;
    const scrollAmount = 300;

    if (direction === "left") {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  };


  useEffect(() => {
    getMyStories();
    dispatch(fetchAllFriendsList(user?.UserID));
    dispatch(fetchAllPosts(user?.UserID));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, dispatch, user?.UserID]);

  if (!user) {
    return <Navigate to="/auth" />;
  };

  return (
    <div className={cx("home")}>
      <div className="container">
        <div className="row">
          <div className="col-xl-7">
            <div className="row">
              <div className={cx("create-article")}>
                <div className="d-flex gap-4 w-100" onClick={openModal}>
                  <img
                    src={
                      user.ProfilePictureURL === "default"
                        ? "/imgs/avatar-trang-4.jpg"
                        : `${import.meta.env.VITE_IMG_URL}${
                            user.ProfilePictureURL
                          }`
                    }
                    alt="avatar"
                    className={cx("img")}
                    style={{ width: "55px" }}
                  />
                  <input
                    type="text"
                    placeholder="What are you thinking?"
                    className="form-control fs-4 fw-bold"
                  />
                </div>
                <Modal
                  isOpen={modalIsOpen}
                  onRequestClose={closeModal}
                  className={cx("modal")}
                  contentLabel="Create Post"
                >
                  <CreatePost
                    closeModal={closeModal}
                    setRefreshTrigger={setRefreshTrigger}
                  />
                </Modal>
                <div className={cx("border")}></div>
                <div className={cx("img-and-emoji")}>
                  <span className="d-flex align-items-center gap-2">
                    <ImageIcon className={cx("img-icon")} />
                    <b className="fs-4 fw-bold text-secondary">Image/Video</b>
                  </span>
                  <span className="d-flex align-items-center gap-2">
                    <EmojiEmotionsIcon className={cx("emoji-icon")} />
                    <b className="fs-4 fw-bold text-secondary">
                      Emotions/Activity
                    </b>
                  </span>
                </div>
              </div>
            </div>
            <div className="row mt-3">
              <div className={cx("stories")}>
                <div className={cx("story-container")} ref={storyContainerRef}>
                  {stories.length > 0 || stories.length > 2 && <ArrowBackIosIcon className="fs-1" onClick={() => handleScroll("left")} id={cx("left-btn")} />}
                  <div className="col-xl-3" id={cx("my-story")}>
                    <img
                      src={
                        user?.ProfilePictureURL === "default"
                          ? "/imgs/avatar-trang-4.jpg"
                          : `${import.meta.env.VITE_IMG_URL}${
                              user?.ProfilePictureURL
                            }`
                      }
                      alt="avatar"
                    />
                    <div className="bg-white pt-2 pb-4 rounded-bottom-4">
                      <span className="d-block text-center">
                        <AddCircleIcon className="fs-1 text-primary" />
                      </span>
                      <p className="fs-5 text-center mt-2">
                        <Link
                          className="text-decoration-none text-dark"
                          to="/stories/create"
                        >
                          Create news
                        </Link>
                      </p>
                    </div>
                  </div>
                  {stories.length === 0 && <div className="card pt-5 pb-5 rounded-top-4 rounded-bottom-4">
                    <p className="fs-3 fw-normal" id={cx("desc")}>Your friends have not posted anything new in the past 24 hours. Let is make friends to learn more.</p>
                  </div>}
                  {stories?.map((story, index) => {
                    if(!story?.Stories[0]?.Content) {
                      return null;
                    }
                    return (
                      <div key={index} className="col-xl-3">
                        <div className={cx("wrapper-item")}>
                          <img
                            src={
                              story?.ProfilePictureURL === "default"
                                ? "/imgs/avatar-trang-4.jpg"
                                : `${import.meta.env.VITE_IMG_URL}${
                                    story?.ProfilePictureURL
                                  }`
                            }
                            alt="avatar"
                            className={cx("img")}
                          />
                          <div>
                            {story?.Stories?.length > 0 && <p className="fs-5 fw-medium text-center pt-4">{story?.Stories[0]?.Content}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {stories.length > 0 || stories.length > 2 && <ArrowForwardIosIcon className="fs-1" onClick={() => handleScroll("right")} id={cx("right-btn")} />}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="d-flex flex-column gap-3">
                {posts?.map((post, index) => {
                  return (
                    <PostItem
                      key={index}
                      post={post}
                      setRefreshTrigger={setRefreshTrigger}
                      isSelected={selectedPostId === post.PostID}
                      handleSelectPost={handleSelectPost}
                      user={user}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          <div className="col-xl-5">
            <div className={cx("marketing")}>
              <h4 className="fs-3 fw-medium text-secondary">Sponsored</h4>
              <div className="d-flex align-items-center gap-4 mt-4">
                <img
                  src="/imgs/456218123_6586719713091_3442355254216464447_n.jpg"
                  alt="Error"
                  className={cx("mkt-img")}
                />
                <p className="fs-3 fw-medium">
                  Market investment thinking wins every situation.
                </p>
              </div>
            </div>
            <div className={cx("border")}></div>
            <div className={cx("friends")}>
              <h4 className="fs-3 fw-medium text-secondary pb-3">Friends</h4>
              <div className={cx("list")}>
                {allFriends?.map((friend, index) => {
                  return (
                    <div
                      key={index}
                      className="d-flex align-items-center gap-3"
                      onClick={() => openChatBox(friend)}
                    >
                      <img
                        src={
                          friend.ProfilePictureURL === "default"
                            ? "/imgs/avatar-trang-4.jpg"
                            : `${import.meta.env.VITE_IMG_URL}${
                                friend.ProfilePictureURL
                              }`
                        }
                        alt="avatar"
                        className={cx("img")}
                      />
                      <h6 className="fs-4 fw-medium">{friend.Username}</h6>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <div className={cx("chat-list")}>
              {selectedFriends?.map((friend) => (
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
    </div>
  );
};

export default Home;
