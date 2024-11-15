import PropTypes from "prop-types";
import { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../../services/peer";
import { useSocket } from "../../utils/socket";
import CallIcon from "@mui/icons-material/Call";

const RoomPage = ({ from, to }) => {
  const socket = useSocket();
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [incomingCall, setIncomingCall] = useState(null);

  // Tạo một audio object tĩnh cho nhạc chuông
  const ringtone = new Audio("/audios/facebook_call.mp3");
  ringtone.loop = true;

  const playRingtone = () => {
    ringtone.play().catch((error) => {
      console.error("Error playing ringtone:", error);
    });
  };

  const stopRingtone = () => {
    ringtone.pause();
    ringtone.currentTime = 0;
  };

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);

    const offer = await peer.getOffer();
    socket.emit("user:call", { fromUserId: from, toUserId: to, offer });
  }, [from, to, socket]);

  const handleIncommingCall = useCallback(
    async ({ fromUserId, offer }) => {
      playRingtone();
      setIncomingCall(fromUserId);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);

      const answer = await peer.getAnswer(offer);
      socket.emit("call:accepted", { fromUserId: to, toUserId: from, answer });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [socket, to, from]
  );

  const sendStreams = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach((track) => {
        if (!peer.peer.getSenders().some(sender => sender.track === track)) {
          peer.peer.addTrack(track, myStream);
        }
      });
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(({ answer }) => {
    if (answer && answer.type) {
      stopRingtone();
      peer.setLocalDescription(answer).catch(console.error);
      sendStreams();
    } else {
      console.error("Invalid answer in handleCallAccepted:", answer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendStreams]);

  const handleNegoNeedIncomming = useCallback(
    async ({ offer }) => {
      const answer = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { fromUserId: to, toUserId: from, answer });
    },
    [socket, from, to]
  );

  const handleNegoNeedFinal = useCallback(async ({ answer }) => {
    if (answer) {
      await peer.setLocalDescription(answer).catch(console.error);
    }
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", (event) => {
      const [stream] = event.streams;
      setRemoteStream(stream);
    });
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("incoming:call", handleIncommingCall);
      socket.on("call:accepted", handleCallAccepted);
      socket.on("peer:nego:needed", handleNegoNeedIncomming);
      socket.on("peer:nego:final", handleNegoNeedFinal);
    }

    return () => {
      if (socket) {
        socket.off("incoming:call", handleIncommingCall);
        socket.off("call:accepted", handleCallAccepted);
        socket.off("peer:nego:needed", handleNegoNeedIncomming);
        socket.off("peer:nego:final", handleNegoNeedFinal);
      }
    };
  }, [
    socket,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div className="container bg-white p-5">
      <div className="row">
        <div className="col-12">
          <h3 className="text-center mb-4 fs-1 fw-bold">Video Call</h3>
          <div className="d-flex justify-content-center gap-3 mb-5 mt-2">
            {myStream && (
              <button className="btn btn-primary fs-4" onClick={sendStreams}>
                Send My Stream
              </button>
            )}
            {incomingCall ? (
              <button
                id="accept-button"
                className="btn btn-success fs-4"
                onClick={() => handleCallAccepted({ answer: peer.peer.localDescription })}
              >
                Accept Call
              </button>
            ) : (
              to && (
                <button
                  id="call-button"
                  className="btn btn-success fs-4"
                  onClick={handleCallUser}
                >
                  <CallIcon className="fs-2" /> Call
                </button>
              )
            )}
          </div>
          <div className="d-flex flex-column align-items-center">
            {myStream && (
              <div className="stream-box mb-5 text-center">
                <h3 className="fs-2 fw-medium mb-4">My Stream</h3>
                <ReactPlayer
                  playing
                  muted
                  height="300px"
                  width="100%"
                  url={myStream}
                  className="rounded border"
                />
              </div>
            )}
            {remoteStream && (
              <div className="stream-box text-center">
                <h3 className="fs-2 fw-medium mb-4">Remote Stream</h3>
                <ReactPlayer
                  playing
                  muted
                  height="300px"
                  width="100%"
                  url={remoteStream}
                  className="rounded border"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

RoomPage.propTypes = {
  from: PropTypes.number.isRequired,
  to: PropTypes.number.isRequired,
};

export default RoomPage;
