import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  IIncomingCall,
  IActiveCall,
  IVideoCallState,
  CallStatus,
} from "./video-slice-types";
import { AppDispatch, RootState } from "../store";
import { socket } from "../../socket/socket";
import { clearPeerConnection } from "../../utiil/peerConnection";

const initialState: IVideoCallState = {
  status: "idle",
   callType: "video",

  incomingCall: null,

  activeCall: null,

  localStream: null,

  remoteStream: null,

  isMuted: false,

  isCameraOff: false,

  error: null,
  

  peerConnection: null,

  isCallModalOpen: false,
  iceCandidatesQueue: [],
};

const videoCallSlice = createSlice({
  name: "videoCall",

  initialState,

  reducers: {
    setCurrentCall(state, action: PayloadAction<IActiveCall | null>) {
      state.activeCall = action.payload;
    },

    setCalling(state) {
      state.status = "calling";
    },
    setCallType(
  state,
  action: PayloadAction<"audio" | "video">
) {
  state.callType = action.payload;
},

    setIncomingCall(state, action: PayloadAction<IIncomingCall>) {
      state.status = "incoming";
      state.incomingCall = action.payload;
    },

    acceptCall(state, action: PayloadAction<IActiveCall>) {
      state.status = "connected";
      state.activeCall = action.payload;
      state.incomingCall = null;
    },

    rejectCall(state) {
      state.status = "rejected";
      state.incomingCall = null;
    },

    endCall(state) {
      state.status = "ended";
      state.incomingCall = null;
      state.activeCall = null;
      state.localStream = null;
      state.remoteStream = null;
      state.peerConnection = null;
      state.iceCandidatesQueue = [];
    },

    setLocalStream(state, action: PayloadAction<MediaStream | null>) {
      state.localStream = action.payload;
    },

    setRemoteStream(state, action: PayloadAction<MediaStream | null>) {
      state.remoteStream = action.payload;
    },

    setPeerConnection(
      state,
      action: PayloadAction<RTCPeerConnection | null>
    ) {
      state.peerConnection = action.payload;
    },

    addIceCandidate(
      state,
      action: PayloadAction<RTCIceCandidateInit>
    ) {
      state.iceCandidatesQueue.push(action.payload);
    },

    clearIceCandidates(state) {
      state.iceCandidatesQueue = [];
    },

    toggleMute(state) {
      state.isMuted = !state.isMuted;
    },

    toggleCamera(state) {
      state.isCameraOff = !state.isCameraOff;
    }, openCallModal(state) {
    state.isCallModalOpen = true;
  },

  closeCallModal(state) {
    state.isCallModalOpen = false;
  },

  toggleCallModal(state) {
    state.isCallModalOpen = !state.isCallModalOpen;
  },

    setError(state, action: PayloadAction<string>) {
      state.status = "failed";
      state.error = action.payload;
    },
    setCallStatus(state, action: PayloadAction<CallStatus>) {
  state.status = action.payload;
},

    clearVideoCall(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setCurrentCall,
  setCalling,
  setIncomingCall,
  acceptCall,
  rejectCall,
  endCall,
  setLocalStream,
  setRemoteStream,
  setPeerConnection,
  addIceCandidate,
  clearIceCandidates,
  toggleMute,
  toggleCamera,
  setCallType,

  openCallModal,
  closeCallModal,
  toggleCallModal,

  setError,
  clearVideoCall,
  setCallStatus
} = videoCallSlice.actions;

export default videoCallSlice.reducer;




export const initiateCall =
  (
    receiverId: string,
    receiverName: string,
    receiverAvatar: string,
    callType: "audio" | "video" = "video"
  ) =>
  async (
    dispatch: AppDispatch,
    getState: () => RootState
  ) => {
    const { user } = getState().auth;

    if (!user) return;

    const callId = `${user._id}-${receiverId}-${Date.now()}`;

    dispatch(
      setCurrentCall({
        callId,
        callerId: user._id,
        receiverId,
        receiverName,
        receiverAvatar,
        callType,
      })
    );

    dispatch(openCallModal());
    dispatch(setCallStatus("calling"));

    socket.emit("initiate_call", {
      callerId: user._id,
      receiverId,
      callType,
      callerInfo: {
        username: user.username,
        profilePicture: user.profileImage,
      },
    });
  };


 export const acceptIncomingCall =
  ({
    callerId,
    callId,
    receiverInfo,
  }: {
    callerId: string;
    callId: string;
    receiverInfo: any;
  }) =>
  async (dispatch: AppDispatch) => {
    dispatch(setCallStatus("connecting"));

    socket.emit("accept_call", {
      callerId,
      callId,
      receiverInfo,
    });
  };
 export const rejectIncomingCall =
  ({
    callerId,
    callId,
  }: {
    callerId: string;
    callId: string;
  }) =>
  async (dispatch: AppDispatch) => {
    dispatch(setCallStatus("rejected"));
    dispatch(closeCallModal());

    socket.emit("reject_call", {
      callerId,
      callId,
    });
  };

export const endCurrentCall =
  ({
    participantId,
    callId,
  }: {
    participantId: string;
    callId: string;
  }) =>
  async (dispatch: AppDispatch) => {
    dispatch(setCallStatus("ended"));
    dispatch(closeCallModal());

    clearPeerConnection();

    socket.emit("end_call", {
      participantId,
      callId,
    });

    dispatch(clearVideoCall());
  };

  export const sendOffer =
  ({
    offer,
    receiverId,
    callId,
  }: {
    offer: RTCSessionDescriptionInit;
    receiverId: string;
    callId: string;
  }) =>
  async () => {
    socket.emit("webrtc_offer", {
      offer,
      receiverId,
      callId,
    });
  };

  export const sendAnswer =
  ({
    answer,
    receiverId,
    callId,
  }: {
    answer: RTCSessionDescriptionInit;
    receiverId: string;
    callId: string;
  }) =>
  async () => {
    socket.emit("webrtc_answer", {
      answer,
      receiverId,
      callId,
    });
  };

  export const sendIceCandidate =
  ({
    candidate,
    senderId,
    receiverId,
    callId,
  }: {
    candidate: RTCIceCandidateInit;
    senderId: string;
    receiverId: string;
    callId: string;
  }) =>
  async () => {
    socket.emit("webrtc_ice_candidate", {
      candidate,
      senderId,
      receiverId,
      callId,
    });
  };
export const processQueuedIceCandidates =
  () =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const { peerConnection, iceCandidatesQueue } = getState().video;

    if (!peerConnection) return;

    for (const candidate of iceCandidatesQueue) {
      try {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (error) {
        console.error("Error adding queued ICE candidate:", error);
      }
    }

    dispatch(clearIceCandidates());
  };

  export const getLocalMedia =
  (callType: "audio" | "video") =>
  async (dispatch: AppDispatch) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video:
          callType === "video"
            ? {
                width: 640,
                height: 480,
              }
            : false,
      });

      dispatch(setLocalStream(stream));

      return stream;
    } catch (err) {
      dispatch(setError("Unable to access microphone/camera"));
      return null;
    }
  };
  
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


// export const createPeerConnection = (
//   stream: MediaStream | null,
//   role: "caller" | "receiver"
// ) => {
//   const pc = new RTCPeerConnection(rtcConfiguration);

//   // Save peer connection in Redux
//   dispatch(setPeerConnection(pc));

//   // Add local tracks
//   if (stream) {
//     stream.getTracks().forEach((track) => {
//       console.log(`${role}: adding ${track.kind} track`);
//       pc.addTrack(track, stream);
//     });
//   }

//   // ICE candidates
//   pc.onicecandidate = (event) => {
//     if (!event.candidate) return;

//     const receiverId =
//       activeCall?.receiverId ?? incomingCall?.callerId;

//     const callId =
//       activeCall?.callId ?? incomingCall?.callId;

//     if (!receiverId || !callId) return;

//     socket.emit("webrtc_ice_candidate", {
//       candidate: event.candidate.toJSON(),
//       senderId: user?._id,
//       receiverId,
//       callId,
//     });
//   };

//   // Receive remote stream
//   pc.ontrack = (event) => {
//     console.log("Remote stream received");

//     if (event.streams.length > 0) {
//       dispatch(setRemoteStream(event.streams[0]));
//     } else {
//       dispatch(setRemoteStream(new MediaStream([event.track])));
//     }
//   };

//   // Connection state
//   pc.onconnectionstatechange = () => {
//     console.log(`${role}: ${pc.connectionState}`);

//     switch (pc.connectionState) {
//       case "connecting":
//         dispatch(setCallStatus("connecting"));
//         break;

//       case "connected":
//         dispatch(setCallStatus("connected"));
//         break;

//       case "failed":
//       case "disconnected":
//         dispatch(setCallStatus("failed"));
//         handleEndCall();
//         break;

//       case "closed":
//         dispatch(setCallStatus("ended"));
//         break;
//     }
//   };

//   // ICE state
//   pc.oniceconnectionstatechange = () => {
//     console.log(`${role}: ICE ${pc.iceConnectionState}`);
//   };

//   // Signaling state
//   pc.onsignalingstatechange = () => {
//     console.log(`${role}: Signaling ${pc.signalingState}`);
//   };

//   return pc;
// };