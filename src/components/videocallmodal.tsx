import { Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../lib/store/hook";
import { useEffect, useMemo, useRef } from "react";
import { endCall, getLocalMedia, setCallStatus, setLocalStream, setRemoteStream, sendOffer, endCurrentCall, acceptIncomingCall, setCurrentCall, rejectIncomingCall } from "../lib/store/video/video-slice";
import { video } from "framer-motion/client";
import Stream from "stream";
import { setPeerConnection } from "../lib/utiil/peerConnection";

interface VideoCallModalProps {
  socket: Socket;
}

const VideoCallModal = ({ socket }: VideoCallModalProps) => {
const localVideoRef = useRef<HTMLVideoElement>(null);
const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const dispatch = useAppDispatch()
  const {activeCall,incomingCall,isCallModalOpen,isCameraOff,iceCandidatesQueue,peerConnection,localStream,remoteStream,callType}= useAppSelector((state)=>state.video)
  const {user}=useAppSelector((state)=>state.auth)
  const {theme}=useAppSelector((state)=>state.theme)
    const isDark = theme === "dark";


    const rtcConfiguration = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302'
    },
     {
      urls: 'stun:stun1.l.google.com:19302'
    }, {
      urls: 'stun:stun2.l.google.com:19302'
    },
  ],
};

// memorize display the user info and its prevent the un necessary re-render

const displayInfo = useMemo(() => {
  if (incomingCall) {
    return {
      name: incomingCall.callerName,
      avatar: incomingCall.callerAvatar,
    };
  }

  if (activeCall) {
    return {
      name: activeCall.receiverName,
      avatar: activeCall.receiverAvatar,
    };
  }

  return null;
}, [incomingCall, activeCall]);

// concetion and detection 

useEffect(() => {
  if (localStream && localVideoRef.current) {
    localVideoRef.current.srcObject = localStream;
  }
}, [localStream]);

useEffect(() => {
  if (remoteStream && remoteVideoRef.current) {
    remoteVideoRef.current.srcObject = remoteStream;
  }
}, [remoteStream]);

// initilalize media streem
const initializeCall = async () => {
  const stream = await dispatch(getLocalMedia("video"));

  if (!stream) return;

  console.log(stream);
};


// const createPeerConnection = (stream, role)=>{
//   const pc = new RTCPeerConnection(rtcConfiguration)

// // add ocal tracks immidately
//   if(stream){
//     stream.getTracks().forEach((track)=>{
//       console.log(`${role} adding ${track.kind} track `, track.id.slice(0,8))
//       pc.addTrack(track,stream)
//     })
//   }

// //handle ice candicate 
// pc.onicecandidate= (event)=>{
//   if(event.candidate && socket){
//     const particpantId = activeCall?.callerId || incomingCall?.callerId
// const callId = activeCall?.callId || incomingCall?.callId
// if(particpantId && callId){
//   socket.emit("webrtc_ice_candidate",{
//     candidate : event.candidate,
//     reciverId:particpantId,
//     callId:callId
//   })
// }
//   }
// }

// // handle remote streem 

// pc.ontrack=(event)=>{
//   if(event.streams && event.streams[0]){
//     dispatch(setRemoteStream(event.streams[0]))
//   }else{
//     const stream = new MediaStream([event.track])
//     dispatch(setRemoteStream(stream))
//   }
// }
// pc.onconnectionstatechange=()=>{
//   console.log(`role :${role} : connection state `, pc.connectionState)
//   if(pc.connectionState === 'failed'){
//     dispatch(setCallStatus('failed'))
//     setTimeout(handleEndCall,2000)
//   }
// }

// pc.oniceconnectionstatechange=()=>{
//   console.log(`${role} : ICE state`,pc.iceConnectionState)
// }

// pc.onsignalingstatechange=()=>{
//   console.log(`${role} : Signalling  state`,pc.signalingState)
// }
// dispatch(setPeerConnection(pc))
// return
// }
const createPeerConnection = (
  stream: MediaStream | null,
  role: "caller" | "receiver"
) => {
  const pc = new RTCPeerConnection(rtcConfiguration);

  // Save peer connection in Redux
  setPeerConnection(pc)

  // Add local tracks
  if (stream) {
    stream.getTracks().forEach((track) => {
      console.log(`${role}: adding ${track.kind} track`);
      pc.addTrack(track, stream);
    });
  }

  // ICE candidates
  pc.onicecandidate = (event) => {
    if (!event.candidate) return;

    const receiverId =
      activeCall?.receiverId ?? incomingCall?.callerId;

    const callId =
      activeCall?.callId ?? incomingCall?.callId;

    if (!receiverId || !callId) return;

    socket.emit("webrtc_ice_candidate", {
      candidate: event.candidate.toJSON(),
      senderId: user?._id,
      receiverId,
      callId,
    });
  };

  // Receive remote stream
  pc.ontrack = (event) => {
    console.log("Remote stream received");

    if (event.streams.length > 0) {
      dispatch(setRemoteStream(event.streams[0]));
    } else {
      dispatch(setRemoteStream(new MediaStream([event.track])));
    }
  };

  // Connection state
  pc.onconnectionstatechange = () => {
    console.log(`${role}: ${pc.connectionState}`);

    switch (pc.connectionState) {
      case "connecting":
        dispatch(setCallStatus("connecting"));
        break;

      case "connected":
        dispatch(setCallStatus("connected"));
        break;

      case "failed":
      case "disconnected":
        dispatch(setCallStatus("failed"));
        break;

      case "closed":
        dispatch(setCallStatus("ended"));
        break;
    }
  };

  // ICE state
  pc.oniceconnectionstatechange = () => {
    console.log(`${role}: ICE ${pc.iceConnectionState}`);
  };

  // Signaling state
  pc.onsignalingstatechange = () => {
    console.log(`${role}: Signaling ${pc.signalingState}`);
  };

  return pc;
};


const initializeCallerCall = async () => {
  try {
    dispatch(setCallStatus("connecting"));

    const stream = await dispatch(getLocalMedia(callType));

    if (!stream || !activeCall) return;

    const pc = createPeerConnection(stream, "caller");

    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: callType === "video",
    });

    await pc.setLocalDescription(offer);

    dispatch(
      sendOffer({
        offer,
        receiverId: activeCall.receiverId,
        callId: activeCall.callId,
      })
    );
  } catch (error) {
    console.error("Error creating offer:", error);
    dispatch(setCallStatus("failed"));
    setTimeout(handleEndCall,2000)
  }
};

// reciver : Answer call 
const handleAnswerCall = async () => {
  try {
    if (!incomingCall || !user) return;

    dispatch(setCallStatus("connecting"));

    // Get local camera/microphone
    const stream = await dispatch(getLocalMedia(incomingCall.callType));

    if (!stream) return;

    // Create peer connection
    createPeerConnection(stream, "receiver");

    // Save current call
    dispatch(
      setCurrentCall({
        callId: incomingCall.callId,
        callerId: incomingCall.callerId,
        receiverId: user._id,
     receiverName: user.username ?? "",
       receiverAvatar: user.profileImage?.url ?? "",
        callType: incomingCall.callType,
      })
    );

    // Notify caller that the call was accepted
    dispatch(
      acceptIncomingCall({
        callerId: incomingCall.callerId,
        callId: incomingCall.callId,
        receiverInfo: {
          _id: user._id,
          username: user.username,
          profilePicture: user.profileImage,
        },
      })
    );
  } catch (error) {
    console.error("Error answering call:", error);
    dispatch(setCallStatus("failed"));
    handleEndCall()
  }
};

const handleRejectCall = () => {
  if (!incomingCall) return;

  dispatch(
    rejectIncomingCall({
      callerId: incomingCall.callerId,
      callId: incomingCall.callId,
    })
  );

  dispatch(endCall());
};

const handleEndCall = () => {
  const participantId =
    activeCall?.receiverId ?? incomingCall?.callerId;

  const callId =
    activeCall?.callId ?? incomingCall?.callId;

  if (!participantId || !callId) return;

  dispatch(
    endCurrentCall({
      participantId,
      callId,
    })
  );
};


// socket event listiner
useEffect(()=>{
  if(!socket) return
  const handleCallAccepted = ({receiverName})=>{
    if(activeCall){
      setTimeout(()=>{
        initializeCallerCall()
      },500)
    }
  }
  const handleCallRejected =()=>{
    setCallStatus('rejected')
    setTimeout(endCall, 2000)
  }
  const handleCallEnded =()=>{
    endCall()
  }
})

  return (
    <div>
      Video Call Modal
    </div>
  );
};

export default VideoCallModal;