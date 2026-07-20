import { useCallback, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

import { useAppDispatch, useAppSelector } from "../lib/store/hook";
import {
  endCall,
  openCallModal,
  setCallStatus,
  setCurrentCall,
  setIncomingCall,
} from "../lib/store/video/video-slice";
import VideoCallModal from "./videocallmodal";

interface Props {
  socket: Socket;
}

const VideoCallManager = ({ socket }: Props) => {
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);

  const [callModal, setCallModal] = useState(false);
  const [callType, setCallType] = useState<"audio" | "video">("audio");

  useEffect(() => {
    if (!socket || !user) return;

    const handleIncomingCall = ({
      callerId,
      callerName,
      callerAvatar,
      callType,
      callId,
    }: {
      callerId: string;
      callerName: string;
      callerAvatar: string;
      callType: "audio" | "video";
      callId: string;
    }) => {
      dispatch(
        setIncomingCall({
          callerId,
          callerName,
          callerAvatar,
          callId,
          callType,
        })
      );

      dispatch(setCallStatus("incoming"));
      dispatch(openCallModal());

      setCallModal(true);
      setCallType(callType);
    };

    const handleCallAccepted = () => {
      dispatch(setCallStatus("connecting"));
    };

    const handleCallEnded = () => {
      dispatch(setCallStatus("ended"));

      setTimeout(() => {
        dispatch(endCall());
        setCallModal(false);
      }, 2000);
    };

    const handleCallFailed = ({ reason }: { reason: string }) => {
      console.log(reason);

      dispatch(setCallStatus("failed"));

      setTimeout(() => {
        dispatch(endCall());
        setCallModal(false);
      }, 2000);
    };

    socket.on("incoming_call", handleIncomingCall);
    socket.on("call_accepted", handleCallAccepted);
    socket.on("call_ended", handleCallEnded);
    socket.on("call_failed", handleCallFailed);

    return () => {
      socket.off("incoming_call", handleIncomingCall);
      socket.off("call_accepted", handleCallAccepted);
      socket.off("call_ended", handleCallEnded);
      socket.off("call_failed", handleCallFailed);
    };
  }, [socket, user, dispatch]);

const initiateCall = useCallback(
  (
    receiverId: string,
    receiverName: string,
    receiverAvatar: string,
    callType: "audio" | "video" = "video"
  ) => {
    const callId = `${user?._id}-${receiverId}-${Date.now()}`;

  dispatch(
  setCurrentCall({
    callId,
    callerId: user!._id,
    receiverId,
    receiverName,
    receiverAvatar,
    callType,
  })
);;


    dispatch(openCallModal());
    dispatch(setCallStatus("calling"));

    socket.emit("initiate_call", {
      callerId: user?._id,
      receiverId,
      callType,
      callerInfo: {
        username: user?.username,
        profilePicture: user?.profileImage,
      },
    });
  },
  [dispatch, socket, user]
);


  return (
    <>
   <VideoCallModal socket={socket} /> // ✅
    </>
  )
};

export default VideoCallManager;