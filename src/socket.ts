"use client";

import io from "socket.io-client";

// Connect to the same port as specified in the server.ts file
const port = process.env.NEXT_PUBLIC_SERVER_PORT || "3000";
export const socket = io(`http://localhost:${port}`, {
  autoConnect: false,
  transports: ["websocket"],
});
