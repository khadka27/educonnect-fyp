"use client";  // Make sure this line is present

import io from "socket.io-client";

export const socket = io('http://localhost:3000');  // Ensure this URL matches your server
