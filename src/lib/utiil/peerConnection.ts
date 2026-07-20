// peerConnection.ts
let peerConnection: RTCPeerConnection | null = null;

export const setPeerConnection = (pc: RTCPeerConnection) => {
  peerConnection = pc;
};

export const getPeerConnection = () => peerConnection;

export const clearPeerConnection = () => {
  peerConnection?.close();
  peerConnection = null;
};