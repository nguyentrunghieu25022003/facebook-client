import PropTypes from "prop-types";
import { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../services/peer";
import { useSocket } from "./socket";

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

  const handleIncommingCall = useCallback(async ({ fromUserId, offer }) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);

    const answer = await peer.getAnswer(offer);
    socket.emit("call:accepted", { fromUserId: to, toUserId: from, answer });
  }, [socket, to, from]);

  const sendStreams = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach(track => peer.peer.addTrack(track, myStream));
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(({ answer }) => {
    peer.setLocalDescription(answer);
    sendStreams();
  }, [sendStreams]);

  /* const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { fromUserId: from, toUserId: to, offer });
  }, [from, to, socket]); */

  const handleNegoNeedIncomming = useCallback(async ({ offer }) => {
    const answer = await peer.getAnswer(offer);
    socket.emit("peer:nego:done", { fromUserId: to, toUserId: from, answer });
  }, [socket, from, to]);

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
  }, [socket, handleIncommingCall, handleCallAccepted, handleNegoNeedIncomming, handleNegoNeedFinal]);

  return (
    <div>
      <h1>Room Page</h1>
      {myStream && <button onClick={sendStreams}>Send My Stream</button>}
      {to && <button onClick={handleCallUser}>CALL {to}</button>}
      {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer playing muted height="100px" width="200px" url={myStream} />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer playing muted height="100px" width="200px" url={remoteStream} />
        </>
      )}
    </div>
  );
};

RoomPage.propTypes = {
  from: PropTypes.number.isRequired,
  to: PropTypes.number.isRequired
};

export default RoomPage;
