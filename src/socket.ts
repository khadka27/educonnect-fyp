"use client";

import io from "socket.io-client";

// Connect to the correct server URL
export const socket = io("http://localhost:3000");
