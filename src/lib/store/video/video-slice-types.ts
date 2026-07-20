export type CallStatus =
  | "idle"
  | "calling"
  |"ringing"
  | "connecting"
  | "incoming"
  | "connected"
  | "rejected"
  | "ended"
  | "failed";

export interface IIncomingCall {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  callType: "audio" | "video";
}

export interface IActiveCall {
  callId: string;
  callerId: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  callType: "audio" | "video";
}

export interface IVideoCallState {
  status: CallStatus;
  callType: "audio" | "video";

  incomingCall: IIncomingCall | null;

  activeCall: IActiveCall | null;

  localStream: MediaStream | null;

  remoteStream: MediaStream | null;

  isMuted: boolean;

  isCameraOff: boolean;

  error: string | null;

  peerConnection: RTCPeerConnection | null;
 isCallModalOpen: boolean;
  iceCandidatesQueue: RTCIceCandidateInit[];
}