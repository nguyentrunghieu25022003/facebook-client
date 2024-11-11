import { useParams } from "react-router-dom";
import RoomPage from "../../utils/room";

const VideoCall = () => {
  const { userId } = useParams();
  const currentUserID = JSON.parse(localStorage.getItem("user")).UserID;

  return (
    <div className="pt-5 pb-5">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div>
              <RoomPage from={currentUserID} to={parseInt(userId)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
