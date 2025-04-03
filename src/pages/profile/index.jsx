import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames/bind";
import "react-lazy-load-image-component/src/effects/blur.css";
import styles from "./profile.module.scss";
import { formatDate } from "../../utils/date";
import { LazyLoadImage } from "react-lazy-load-image-component";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import AddBoxIcon from "@mui/icons-material/AddBox";
import CakeIcon from "@mui/icons-material/Cake";
import EmailIcon from "@mui/icons-material/Email";
import EditIcon from "@mui/icons-material/Edit";
import ImageIcon from "@mui/icons-material/Image";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { fetchUserProfile, fetchAllMyPost, fetchAllFriendsList } from "../../api/index";
import axios from "axios";
import Modal from "react-modal";
import PostItem from "../../components/post/index";
import CreatePost from "../create-post/index";
import Loading from "../../components/loading/index";

const cx = classNames.bind(styles);

const Profile = () => {
  const dispatch = useDispatch();
  const friendsState = useSelector((state) => state.friends);
  const friends = friendsState.items?.ReceivedFriends?.concat(friendsState.items?.RequestedFriends) || [];
  const [profile, setProfile] = useState({});
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const { userId } = useParams();
  const userJSON = localStorage.getItem("user");
  const user = JSON.parse(userJSON);
  const isCurrentUser = userId === user.UserID.toString();

  const handleCoverPhotoChange = (event) => {
    setCoverPhoto(event.target.files[0]);
  };

  const handleAvatarChange = (event) => {
    setAvatar(event.target.files[0]);
  };

  const handleSelectPost = (postId) => {
    setSelectedPostId(postId === selectedPostId ? null : postId);
  };

  const fetchProfile = async () => {
    try {
      const response = await fetchUserProfile(userId);
      setProfile(response);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
    }
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

  const handleSubmitCoverPhoto = async () => {
    const formData = new FormData();
    const imageFile = document.querySelector(".cover-photo-file").files[0];
    if (imageFile) {
      formData.append("Cover-Photo", imageFile);
    }
    try {
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/user/cover-photo/upload/${user.UserID}`, formData,
        { 
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if(response.status === 200) {
        setCoverPhoto(null);
        await fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitAvatar = async () => {
    const formData = new FormData();
    console.log("File", document.querySelector(".avatar-file"))
    const imageFile = document.querySelector(".avatar-file").files[0];
    if (imageFile) {
      formData.append("Avatar", imageFile);
    }
    try {
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/user/avatar/upload/${user.UserID}`, formData,
        { 
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if(response.status === 200) {
        setAvatar(null);
        await fetchProfile();
      }
    } catch (err) {
      console.error(err);
    };
  };

  useEffect(() => {
    setIsLoading(true);
    fetchProfile();
    dispatch(fetchAllFriendsList(userId));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, userId]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchAllMyPost(userId);
        setPosts(response);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [refreshTrigger, userId]);

  if(isLoading) {
    return <Loading />;
  };

  return (
    <div className={cx("profile")}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-9">
            <div className={cx("wrapper")}>
              <div className={cx("banner")}>
                <LazyLoadImage
                  effect="blur"
                  src={profile.CoverPhotoURL === "default" ? "/imgs/anh-bia-facebook-phong-canh-thien-nhien-dep-tren-moi-mien.jpg" : `${import.meta.env.VITE_IMG_URL}${profile.CoverPhotoURL}`}
                  alt="banner"
                  className={cx("banner-img")} 
                />
                {isCurrentUser && (
                  <>
                    <button className={cx("cover-photo-button")}>
                      <CameraAltIcon className={cx("camera-icon")} />
                      <span>Add cover photo</span>
                      <input type="file" className="cover-photo-file" id={cx("file-input")} onChange={handleCoverPhotoChange} />
                    </button>
                    {coverPhoto && (
                      <div className="d-flex align-items-center gap-3" id={cx("btn-group")}>
                        <button className="btn btn-primary fs-5" onClick={() => handleSubmitCoverPhoto()}>Save</button>
                        <button className="btn btn-light fs-5" onClick={() => setCoverPhoto(null)}>Cancel</button>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className={cx("profile-header")}>
                <div className={cx("profile-info")}>
                  <div className="d-flex flex-column">
                    <LazyLoadImage
                      effect="blur"
                      src={profile.ProfilePictureURL === "default" ? "/imgs/avatar-trang-4.jpg" : `${import.meta.env.VITE_IMG_URL}${profile?.ProfilePictureURL}`}
                      alt="avatar"
                    />
                    {isCurrentUser && (
                      <>
                        <button className={cx("avatar-photo-button")}>
                          <CameraAltIcon className={cx("camera-icon")} />
                          <input type="file" className="avatar-file" id={cx("file-input")} onChange={handleAvatarChange} />
                        </button>
                        {avatar && (
                          <div className="d-flex justify-content-center gap-3">
                            <button className="btn btn-primary fs-5" onClick={() => handleSubmitAvatar()}>Save</button>
                            <button className="btn btn-light fs-5" onClick={() => setAvatar(null)}>Cancel</button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div>
                    <h6 className="fs-1 fw-bold">{profile.Username}</h6>
                    <b className="d-block fs-3 fw-medium mt-3 text-secondary">
                      {friends.length} friends
                    </b>
                  </div>
                </div>
                {!isCurrentUser ? (
                  <div className={cx("profile-actions")}>
                    <button className="btn btn-primary fs-4 d-flex align-items-center gap-2">
                      <ChatBubbleIcon className="fs-2" />
                      Message
                    </button>
                    <form>
                      <button className="btn btn-light fs-4 d-flex align-items-center gap-2">
                        <AddBoxIcon className="fs-1" />
                        Add friend
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className={cx("profile-actions")}>
                    <button className="btn btn-primary fs-4 d-flex align-items-center gap-2">
                      <AddBoxIcon className="fs-2" />
                      Add to news
                    </button>
                    <form>
                      <button className="btn btn-light fs-4 d-flex align-items-center gap-2">
                        <EditIcon className="fs-1" />
                        Edit personal page
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-xl-4">
            <div className={cx("card-custom")}>
              <h5 className="fs-2 fw-medium pb-4">Introduce</h5>
              <p className="fs-4 pt-2 pb-2">
                {user.Bio === "default" ? "This is my bio" : user.Bio}
              </p>
              {isCurrentUser && <button className="btn btn-light w-100 fs-4 fw-bold mt-2">Edit my bio</button>}
              <p className="fs-4 pt-4 pb-2">
                <CakeIcon className="fs-1 pb-2" />{" "}
                {formatDate(profile.DateOfBirth)}
              </p>
              <p className="fs-4 pt-2 pb-2">
                <EmailIcon className="fs-1 pb-2" /> {profile.Email}
              </p>
              {isCurrentUser && (
                <>
                  <button className="btn btn-light w-100 fs-4 fw-bold mt-2">
                    Edit details
                  </button>
                  <button className="btn btn-light w-100 fs-4 fw-bold mt-3">
                    Add notable content
                  </button>
                </>
              )}
            </div>
            <div className={cx("card-custom")}>
              <h5 className="fs-2 fw-medium">Images</h5>
              <div className={cx("imgs")}></div>
            </div>
            <div className={cx("card-custom")}>
              <h5 className="fs-2 fw-medium">Friends</h5>
              <p className="fs-4 text-dark pt-3 pb-2">{friends.length === 0 ? "No friends" : `${friends.length} friends` }</p>
              <div className={cx("friends")}>
                <div className="row">
                  {friends.map((friend, index) => {
                    return (
                      <Link key={index} to={`/profile/${friend.UserID}/${friend.Username}`} className="col-xl-4 text-decoration-none">
                        <LazyLoadImage
                          effect="blur"
                          src={friend.ProfilePictureURL === "default" ? "/imgs/avatar-trang-4.jpg" : `${import.meta.env.VITE_IMG_URL}${friend?.ProfilePictureURL}`}
                          alt="avatar"
                        />
                        <h6 className="fs-5 text-dark fw-bold pt-3">{friend.Username}</h6>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-5">
            {profile.UserID === user?.UserID && <div className={cx("create-article")}>
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
            </div>}
            <div>
              {posts.map((post, index) => {
                return (
                  <div key={index}>
                    <PostItem
                      post={post}
                      isSelected={selectedPostId === post.PostID}
                      handleSelectPost={handleSelectPost}
                      user={user}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;