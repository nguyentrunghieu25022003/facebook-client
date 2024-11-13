import classNames from "classnames/bind";
import styles from "./friends.module.scss";
import axios from "axios";
import "react-lazy-load-image-component/src/effects/blur.css";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { fetchAllFriendListSuggested } from "../../api/index";
import { useState, useEffect } from "react";

const cx = classNames.bind(styles);

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [accepts, setAccepts] = useState([]);
  const UserID = JSON.parse(localStorage.getItem("user"))?.UserID;

  const handleAccept = async (friendShipID) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/page/accepted/${friendShipID}`);
      if(response.status === 200) {
        console.log("Accepted !");
        setAccepts((prev) => [...prev, friendShipID]);
      }   
    } catch (err) {
      console.log("Error: " + err.message);
    }
  }

  useEffect(() => {
    (async () => {
      const response = await fetchAllFriendListSuggested(UserID);
      setFriends(response.ReceivedFriends);
    })();
  }, [UserID]);

  return (
    <div className={cx("friends")}>
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <h3 className="fs-1 fw-bold">Friend invitation</h3>
          </div>
        </div>
        <div className="row mt-4">
          {friends.map((friend, index) => {
            const isAccepted = accepts.includes(friend.Friendship.FriendshipID);
            return (
              <div key={index} className="col-xl-3">
                <div className="card">
                  <LazyLoadImage
                    effect="blur"
                    src={friend.ProfilePictureURL === "default" ? "/imgs/avatar-trang-4.jpg" : `${import.meta.env.VITE_IMG_URL}${friend.ProfilePictureURL}`}
                    alt="avatar"
                    className="w-100 rounded-top"
                  />
                  <div className={cx("desc")}>
                    <h6 className="fs-3 fw-medium pt-2 pb-5">{friend.Username}</h6>
                    <button className="btn btn-primary w-100 fs-5 fw-medium" onClick={() => handleAccept(friend.Friendship.FriendshipID)} disabled={isAccepted}>{isAccepted ? "Accepted" : "Accept"}</button>
                    <button className="btn btn-light w-100 fs-5 fw-medium mt-3">Remove</button>
                  </div>
                </div>
              </div>
            );
          })}
          {friends.length === 0 && <strong className="fs-3 fw-normal">No friends</strong>}
        </div>
      </div>
    </div>
  );
};

export default Friends;
