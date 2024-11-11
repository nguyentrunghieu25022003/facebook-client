import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames/bind";
import styles from "./video.module.scss";
import { fetchAllMyVideoPost, fetchAllFriendsList } from "../../api/index";
import PostItem from "../../components/post/index";
import ChatBox from "../../components/chat/index";

const cx = classNames.bind(styles);

const Video = () => {
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [posts, setPosts] = useState([]);
  const dispatch = useDispatch();
  const friendsState = useSelector((state) => state.friends);
  const allFriends = friendsState.items?.ReceivedFriends?.concat(friendsState.items?.RequestedFriends) || [];
  const user = JSON.parse(localStorage.getItem("user"));

  const handleSelectPost = (postId) => {
    setSelectedPostId(postId === selectedPostId ? null : postId);
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
      const response = await fetchAllMyVideoPost();
      setPosts(response);
    })();
    dispatch(fetchAllFriendsList(user.UserID));
  }, [refreshTrigger, dispatch, user.UserID]);


  return (
    <div className={cx("home")}>
      <div className="container">
        <div className="row">
          <div className="col-xl-7">
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

export default Video;