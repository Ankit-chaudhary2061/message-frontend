"use client";

import { useEffect } from "react";
import { socket } from "./socket";
import { useAppDispatch, useAppSelector } from "../store/hook";
import {
  registerSocketListeners,
  removeSocketListeners,
} from "./socket-listener";

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user?._id) return;

    // Connect socket
    socket.connect();

    // Debug connection
  socket.on("connect", () => {
  console.log("✅ Socket Connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket Connection Error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket Disconnected:", reason);
});

    // Tell backend this user is online
    socket.emit("user-connected", user._id);

    // Register all chat listeners
    registerSocketListeners(socket, dispatch);

    return () => {
      removeSocketListeners(socket);

      socket.off("connect");
      socket.off("disconnect");

      socket.disconnect();
    };
  }, [user, dispatch]);

  return <>{children}</>;
}