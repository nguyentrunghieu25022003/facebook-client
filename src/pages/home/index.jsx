import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./home.module.scss";
import { fetchAllPosts, fetchAllFriendsList} from "../../api/index";
import AddIcon from "@mui/icons-material/Add";
import ImageIcon from "@mui/icons-material/Image";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import PostItem from "../../components/post/index";
import Modal from "react-modal";
import CreatePost from "../create-post/index";
import CreateStory from "../create-story/index";
import ChatBox from "../../components/chat/index";

const cx = classNames.bind(styles);

const Home = () => {
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [storyIsOpen, setStoryIsOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const dispatch = useDispatch();
  const friendsState = useSelector((state) => state.friends);
  const postsState = useSelector((state) => state.posts);
  const allFriends = friendsState.items?.ReceivedFriends?.concat(friendsState.items?.RequestedFriends) || [];
  const posts = postsState.items || [];
  const user = JSON.parse(localStorage.getItem("user"));

  const handleSelectPost = (postId) => {
    setSelectedPostId(postId === selectedPostId ? null : postId);
  };

  const openModelStory = (event) => {
    if (event) {
      event.preventDefault();
    }
    setStoryIsOpen(true);
  };

  const closeModalStory = (event) => {
    if (event) {
      event.preventDefault();
    }
    setStoryIsOpen(false);
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
    dispatch(fetchAllFriendsList(user?.UserID));
    dispatch(fetchAllPosts(user?.UserID));
  }, [refreshTrigger, dispatch, user?.UserID]);


  return (
    <div className={cx("home")}>
      <div className="container">
        <div className="row">
          <div className="col-xl-7">
            <div className={cx("create-post-box")}>
              <Link to="/">
                <button>
                  <AddIcon
                    className="fs-1"
                    style={{ color: "var(--primary-color)" }}
                  />
                </button>
              </Link>
              <div className="d-flex flex-column row-gap-2" onClick={openModelStory}>
                <b className="fs-3 fw-medium">Create news</b>
                <p className="fs-4 fw-normal text-secondary">You can share a photo or write something</p>
              </div>
              <Modal
                isOpen={storyIsOpen}
                onRequestClose={closeModalStory}
                className={cx("modal")}
                contentLabel="Create Story"
              >
                <CreateStory
                  closeModal={closeModalStory}
                />
              </Modal>
            </div>
            <div className={cx("create-article")}>
              <div className="d-flex gap-4 w-100" onClick={openModal}>
                <img
                  src={user.ProfilePictureURL === "default" ? "/imgs/avatar-trang-4.jpg" : `${import.meta.env.VITE_IMG_URL}${user.ProfilePictureURL}`}
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
                  <b className="fs-4 fw-bold text-secondary">Emotions/Activity</b>
                </span>
              </div>
            </div>
            <div className="d-flex flex-column gap-3">
              {posts.map((post, index) => {
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
                {allFriends.map((friend, index) => {
                  return (
                    <div
                      key={index}
                      className="d-flex align-items-center gap-3"
                      onClick={() => openChatBox(friend)}
                    >
                      <img
                        src={friend.ProfilePictureURL === "default" ? "/imgs/avatar-trang-4.jpg" : `${import.meta.env.VITE_IMG_URL}${friend.ProfilePictureURL}`}
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
    </div>
  );
};

export default Home;