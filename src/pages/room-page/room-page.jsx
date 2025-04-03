import { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import { useSocket } from "../../custom/socket";
import Loading from "../../components/loading/index";

const RoomPage = () => {
  const { socket } = useSocket();
  const Username = JSON.parse(localStorage.getItem("user")).Username || "";
  const me = sessionStorage.getItem("id") || "";
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState(Username);
  const [isLoading, setIsLoading] = useState(false);
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    setIsLoading(true);
    
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        setIsLoading(false);
      });

    if (socket) {
      socket.on("callUser", (data) => {
        setReceivingCall(true);
        setCaller(data.from);
        setName(data.name);
        setCallerSignal(data.signal);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (stream && myVideo.current) {
      myVideo.current.srcObject = stream;
    }
  }, [stream, myVideo]);

  const callUser = (id) => {
    if (!socket || !me || !stream) {
      console.error("Socket or peer ID or MediaStream not initialized");
      return;
    }
    const peer = new window.SimplePeer({
        initiator: true,
        trickle: false,
        stream: stream,
    });
    peer?.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });
    peer?.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });
    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer?.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    if (!socket || !stream) {
      console.error("Socket or MediaStream not initialized");
      return;
    }
    setCallAccepted(true);
    const peer = new window.SimplePeer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer?.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });
    peer?.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer?.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  if(isLoading) {
    return <Loading />;
  };

  return (
    <div className="container py-5 bg-white">
      <h3 className="text-center text-dark mb-5 fs-1 fw-medium">Zoomish</h3>
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4 mb-4">
          <h5 className="text-center fs-4 fw-medium mb-2">You</h5>
          <div className="card p-3">
            {stream && (
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                className="w-100 border rounded"
              />
            )}
          </div>
        </div>
        <div className="col-md-5 col-lg-4 mb-4">
          <h5 className="text-center fs-4 fw-medium mb-2">User Video</h5>
          <div className="card p-3">
            {callAccepted && !callEnded ? (
              <video
                playsInline
                ref={userVideo}
                autoPlay
                className="w-100 border rounded"
              />
            ) : (
              <span className="text-center">
                <PersonIcon style={{ fontSize: "19rem"}} />
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="row justify-content-center mt-3">
        <div className="col-md-6 text-center">
          <TextField
            id="filled-basic"
            label="Name"
            variant="filled"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-3 w-100"
            InputLabelProps={{
              style: { fontSize: "1.6rem" },
            }}
            InputProps={{
              style: { fontSize: "1.8rem" },
            }}
          />
          <TextField
            id="filled-basic"
            label="ID to call"
            variant="filled"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
            className="mb-3 w-100"
            InputLabelProps={{
              style: { fontSize: "1.6rem" },
            }}
            InputProps={{
              style: { fontSize: "1.8rem" },
            }}
          />
        </div>
      </div>
      <div className="row justify-content-center mt-3">
        <div className="col-md-6 text-center">
          <input
            type="text"
            className="form-control fs-4 mb-3 text-center"
            value={me}
            disabled
          />
          <CopyToClipboard text={me}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AssignmentIcon fontSize="large" />}
              className="mb-3 fs-5"
            >
              Copy ID
            </Button>
          </CopyToClipboard>
        </div>
      </div>
      <div className="row justify-content-center mt-3">
        <div className="col-md-6 text-center">
          {callAccepted && !callEnded ? (
            <Button variant="contained" color="secondary" onClick={leaveCall}>
              End Call
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              startIcon={<PhoneIcon fontSize="large" />}
              onClick={() => callUser(idToCall)}
              className="mb-3 fs-5"
            >
              Call
            </Button>
          )}
        </div>
      </div>
      <div className="row justify-content-center mt-3">
        <div className="col-md-6 text-center">
          {receivingCall && !callAccepted && (
            <div className="alert alert-info">
              <h5>{name} is calling...</h5>
              <Button variant="contained" color="primary" onClick={answerCall}>
                Answer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomPage;