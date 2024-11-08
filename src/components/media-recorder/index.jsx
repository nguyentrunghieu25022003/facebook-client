import PropTypes from "prop-types";
import classNames from "classnames/bind";
import styles from "./media-recorder.module.scss";
import { useState, useEffect } from "react";
import MicIcon from "@mui/icons-material/Mic";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import CancelIcon from "@mui/icons-material/Cancel";

const cx = classNames.bind(styles);

const AudioRecorder = ({ audioBlob, setAudioBlob, isAudioActive, setIsAudioActive }) => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const recorder = new MediaRecorder(stream);
          setMediaRecorder(recorder);
        })
        .catch((error) => {
          console.error("Error accessing the microphone: ", error);
        });
    }
  }, []);

  const startRecording = () => {
    if (mediaRecorder) {
      const audioChunks = [];
      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        setIsAudioActive(true);
      };
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const resetRecorder = () => {
    if (mediaRecorder) {
      setAudioBlob(null);
      setIsRecording(false);
      setIsAudioActive(false);
      mediaRecorder.ondataavailable = null;
      mediaRecorder.onstop = null;
    }
  };

  return (
    <div className="d-flex align-items-center gap-2">
      {isRecording ? (
        <>
          {!audioBlob && (
            <span onClick={stopRecording} disabled={!isRecording}>
              <StopCircleIcon className="fs-1 text-dark" />
            </span>
          )}
        </>
      ) : (
        <>
          {!audioBlob && (
            <span onClick={startRecording} disabled={isRecording}>
              <MicIcon className="fs-1 text-dark" />
            </span>
          )}
        </>
      )}
      {!audioBlob && isAudioActive && (
        <strong className="fs-4 fw-bold text-dark">Recording...</strong>
      )}
      {audioBlob && (
        <>
          <span onClick={resetRecorder}>
            <CancelIcon className="fs-1 text-dark" />
          </span>
          <audio
            src={URL.createObjectURL(audioBlob)}
            controls
            className={cx("audio")}
          />
        </>
      )}
    </div>
  );
};

AudioRecorder.propTypes = {
  audioBlob: PropTypes.bool,
  setAudioBlob: PropTypes.func.isRequired,
  isAudioActive: PropTypes.bool.isRequired,
  setIsAudioActive: PropTypes.func.isRequired,
};

export default AudioRecorder;