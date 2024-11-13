import PropTypes from "prop-types";
import { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../../services/peer";
import { useSocket } from "../../utils/socket";
import classNames from "classnames/bind";
import styles from "./room-page.module.scss";

const cx = classNames.bind(styles);

const RoomPage = ({ from, to }) => {
  const socket = useSocket();
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);

      const answer = await peer.getAnswer(offer);
      socket.emit("call:accepted", { fromUserId: to, toUserId: from, answer });
    },
    [socket, to, from]
  );

  const sendStreams = useCallback(() => {
    if (myStream) {
      myStream
        .getTracks()
        .forEach((track) => peer.peer.addTrack(track, myStream));
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ answer }) => {
      peer.setLocalDescription(answer);
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeedIncomming = useCallback(
    async ({ offer }) => {
      const answer = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { fromUserId: to, toUserId: from, answer });
    },
    [socket, from, to]
  );

  const handleNegoNeedFinal = useCallback(async ({ answer }) => {
    await peer.setLocalDescription(answer);
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
    <div className="container">
      <div className="row">
        <div className="col-xl-12">
          <h1 className="mb-4 fs-1 fw-bold">Room</h1>
          <div className="d-flex align-items-center gap-3">
            {myStream && (
              <button className="btn btn-primary fs-4" onClick={sendStreams}>
                Send My Stream
              </button>
            )}
            {to && (
              <button className="btn btn-success fs-4" onClick={handleCallUser}>
                Call {to}
              </button>
            )}
          </div>
          <div className={cx("stream-container")}>
            {myStream && (
              <div className="mt-5">
                <h2 className="fs-2 fw-medium mb-4">My Stream</h2>
                <ReactPlayer
                  playing
                  muted
                  height="200px"
                  width="500px"
                  url={myStream}
                />
              </div>
            )}
            {remoteStream && (
              <div className="mt-5">
                <h2 className="fs-2 fw-medium mb-4">Remote Stream</h2>
                <ReactPlayer
                  playing
                  muted
                  height="200px"
                  width="500px"
                  url={remoteStream}
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
