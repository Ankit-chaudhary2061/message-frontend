import { Socket } from "socket.io-client";
import NextImage from "next/image";
import { useAppDispatch, useAppSelector } from "../lib/store/hook";
import { useEffect, useMemo, useRef } from "react";
import { endCall, getLocalMedia, setCallStatus, setLocalStream, setRemoteStream, sendOffer, endCurrentCall, acceptIncomingCall, setCurrentCall, rejectIncomingCall, sendAnswer, processQueuedIceCandidates, addIceCandidate, toggleCamera, toggleMute } from "../lib/store/video/video-slice";
import { div, video } from "framer-motion/client";
import Stream from "stream";
import { setPeerConnection } from "../lib/utiil/peerConnection";
import { FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaTimes, FaVideo, FaVideoSlash } from "react-icons/fa";


interface VideoCallModalProps {
  socket: Socket;
}

const VideoCallModal = ({ socket }: VideoCallModalProps) => {
const localVideoRef = useRef<HTMLVideoElement>(null);
const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const dispatch = useAppDispatch()
  const {activeCall, isMuted,incomingCall,isCallModalOpen, status: callStatus,isCameraOff,iceCandidatesQueue,peerConnection,localStream,remoteStream,callType}= useAppSelector((state)=>state.video)
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
const handleToggleVideo = () => {
  if (!localStream) return;

  localStream.getVideoTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });

  dispatch(toggleCamera());
};

const handleToggleAudio = () => {
  if (!localStream) return;

  localStream.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });

  dispatch(toggleMute());
};

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
   const handleCallAccepted = ({ receiverName }: any) => {
    if (activeCall) {
      setTimeout(() => {
        initializeCallerCall();
      }, 500);
    }
  };

 const handleCallRejected = () => {
    dispatch(setCallStatus("rejected"));
    setTimeout(() => {
      dispatch(endCall());
    }, 2000);
  };

  const handleCallEnded = () => {
    dispatch(endCall());
  };

const handleWebRTCOffer = async ({
  offer,
  senderId,
  callId,
}: {
  offer: RTCSessionDescriptionInit;
  senderId: string;
  callId: string;
}) => {
  if (!peerConnection) return;

  try {
    // 1. Set the remote offer
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    // 2. Process any ICE candidates that arrived early
    await dispatch(processQueuedIceCandidates());

    // 3. Create the answer
    const answer = await peerConnection.createAnswer();

    // 4. Set local description
    await peerConnection.setLocalDescription(answer);

    // 5. Send answer
    dispatch(
      sendAnswer({
        answer,
        receiverId: senderId,
        callId,
      })
    );

    console.log("Receiver: Answer sent");
  } catch (err) {
    console.error(err);
  }
};


const handleWebRTCAnswer = async ({
  answer,
}: {
  answer: RTCSessionDescriptionInit;
}) => {
  if (!peerConnection) return;

  if (peerConnection.signalingState === "closed") {
    console.log("Caller: PeerConnection is closed");
    return;
  }

  try {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer)
    );

    await dispatch(processQueuedIceCandidates());

    console.log("Caller: Remote answer set");
  } catch (error) {
    console.error(error);
  }
};


// reciver ice candidates
const handleWebRTCIceCandidates = async ({
  candidate,
}: {
  candidate: RTCIceCandidateInit;
}) => {
  if (!peerConnection) return;

  try {
    if (peerConnection.remoteDescription) {
      await peerConnection.addIceCandidate(
        new RTCIceCandidate(candidate)
      );

      console.log("ICE candidate added");
    } else {
      dispatch(addIceCandidate(candidate));

      console.log("ICE candidate queued");
    }
  } catch (error) {
    console.error("Failed to add ICE candidate:", error);
  }
};
// register all events listiners 
socket.on("call_accepted", handleCallAccepted);
socket.on("call_rejected", handleCallRejected);
socket.on("call_ended", handleCallEnded);

socket.on("webrtc_offer", handleWebRTCOffer);
socket.on("webrtc_answer", handleWebRTCAnswer);
socket.on("webrtc_ice_candidate", handleWebRTCIceCandidates);

console.log('socket listener register')
return () => {
socket.off("call_accepted", handleCallAccepted);
socket.off("call_rejected", handleCallRejected);
socket.off("call_ended", handleCallEnded);

socket.off("webrtc_offer", handleWebRTCOffer);
socket.off("webrtc_answer", handleWebRTCAnswer);
socket.off("webrtc_ice_candidate", handleWebRTCIceCandidates);
}

},[socket, peerConnection, activeCall, dispatch])


if(!incomingCall && !isCallModalOpen ) return null

const shouldShowActiveCall =
  activeCall !== null ||
  callStatus === "calling" ||
  callStatus === "connecting";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 ">
      <div className={`relative w-full h-full max-w-4xl max-h-3xl rounded-lg overflow-hidden ${isDark ? "bg-gray-900":" bg-white"}`}>

    {/* incoming call  ui  */}

    {incomingCall && !activeCall && (

      <div className="flex flex-col items-center justify-center h-full p-8 ">
        <div className=" text-center mb-8">
      <div className=" w-32 h-32 rounded-full bg-gray-300 mx-auto mb-4 overflow-hidden">
       <NextImage
  src={displayInfo?.avatar || "/default-avatar.png"}
  alt={displayInfo?.name || "User"}
  width={128}
  height={128}
  className="w-full h-full object-cover"
/>



      </div>
      <h2 className={`text-2xl font-semibold mb-2 ${isDark ? "text-white" : "bg-gray-900"}`}>{displayInfo?.name}</h2>
      <p className={`text-lg ${isDark ? "text-gray-300":"text-gray-600"}`}> incoming {callType} call ...</p>
        </div>
<div className="flex space-x-6">

  <button 
  onClick={handleRejectCall}
  className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors">
    <FaPhoneSlash className="w-6 h-6"/>
  </button>
   <button 
  onClick={handleAnswerCall}
  className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors">
    <FaVideo className="w-6 h-6"/>
  </button>
</div>
       </div> 
    )}


{/* active call Ui */}
{shouldShowActiveCall && (
  <div className="relative w-full h-full">
    {callType === "video" && (
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover bg-gray-800 ${
          remoteStream ? "block" : "hidden"
        }`}
      />
    )}
  </div>
)}


{/* avatar/status display */}
{(!remoteStream || callType === "video")&& (

    <div className="w-full  h-full bg-gray-800 flex items-center justify-center">
      <div className=" text-center">
   <div className=" w-32 h-32 rounded-full bg-gray-600 mx-auto mb-4 overflow-hidden">

 <NextImage
  src={displayInfo?.avatar || "/default-avatar.png"}
  alt={displayInfo?.name || "User"}
  width={128}
  height={128}
  className="w-full h-full object-cover"
/>
</div>
<p className="text-white text-xl">
  {callStatus === "calling"
    ? `Calling ${displayInfo?.name}...`
    : callStatus === "connecting"
    ? "Connecting..."
    : callStatus === "connected"
    ? displayInfo?.name
    : callStatus === "failed"
    ? "Connection failed"
    : displayInfo?.name}
</p>

      </div>


    </div>
  )}


{/* local video  (picture in picture ) */}
{callType === "video" && localStream && (
  <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
    <video
      ref={localVideoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover"
    />
  </div>
)}

{/* call status  */}
<div className="absolute top-4 left-4">
  <div
    className={`px-3 py-2 rounded-full ${
      isDark ? "bg-gray-800" : "bg-white"
    } bg-opacity-75`}
  >
    <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
      {callStatus === "connected" ? "Connected" : callStatus}
    </p>
  </div>
</div>



{/* Call controls */}
<div className="absolute bottom-8 left-1/2 -translate-x-1/2">
  <div className="flex space-x-5">
    {callType === "video" && (
    <button
  onClick={handleToggleVideo}
  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
    !isCameraOff
      ? "bg-gray-600 hover:bg-gray-700 text-white"
      : "bg-red-500 hover:bg-red-600 text-white"
  }`}
>
  {!isCameraOff ? (
    <FaVideo className="w-5 h-5" />
  ) : (
    <FaVideoSlash className="w-5 h-5" />
  )}
</button>
    )}
      <button
  onClick={handleToggleAudio}
  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
    !isMuted
      ? "bg-gray-600 hover:bg-gray-700 text-white"
      : "bg-red-500 hover:bg-red-600 text-white"
  }`}
>
  {!isMuted ? (
    <FaMicrophone className="w-5 h-5" />
  ) : (
    <FaMicrophoneSlash className="w-5 h-5" />
  )}
</button>
  <button 
  onClick={handleEndCall}
  className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors">
    <FaPhoneSlash className="w-6 h-6"/>
  </button>
  </div>
</div>

{callStatus === "calling" && (
  <button
    onClick={handleEndCall}
    className="absolute top-4 right-4 w-10 h-10 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
  >
    <FaTimes className="w-4 h-4" />
  </button>
)}
      </div>
    </div>
  );
};

export default VideoCallModal;