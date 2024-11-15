import { useParams } from "react-router-dom";
import RoomPage from "../room-page/room-page";

const VideoCall = () => {
  return (
    <div className="pt-5 pb-5">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div>
              <RoomPage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
