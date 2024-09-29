// "use client";

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Send, Plus, Phone, Video } from "lucide-react";
// import axios from "axios";
// import { useSession } from "next-auth/react";
// import io, { Socket } from "socket.io-client";
// import { useToast } from "@/hooks/use-toast";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import EmojiPicker from "emoji-picker-react";

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   profileImage: string | null;
//   status: string;
//   username: string;
// }

// interface Message {
//   id: string;
//   content: string;
//   senderId: string;
//   receiverId: string;
//   createdAt: string;
//   sender: {
//     id: string;
//     name: string;
//     profileImage: string | null;
//     username: string;
//   };
//   fileUrl?: string; // Optional if a message can be sent without a file
// }

// export default function ChatUI() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const { data: session } = useSession();
//   const { toast } = useToast();
//   const socketRef = useRef<typeof Socket | null>(null);

//   // Initialize Socket.io
//   const socketInitializer = useCallback(() => {
//     if (socketRef.current) return; // Avoid re-initializing

//     socketRef.current = io(
//       process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001",
//       {
//         transports: ["websocket"],
//       }
//     );

//     socketRef.current.on("connect", () => {
//       console.log("Connected to Socket.io server");
//       if (session?.user?.id) {
//         socketRef.current?.emit("joinChat", session.user.id);
//       }
//     });

//     socketRef.current.on("receiveMessage", (message: Message) => {
//       if (
//         (message.senderId === selectedUser?.id &&
//           message.receiverId === session?.user?.id) ||
//         (message.senderId === session?.user?.id &&
//           message.receiverId === selectedUser?.id)
//       ) {
//         setMessages((prevMessages) => [...prevMessages, message]);
//         scrollToBottom();
//       }
//     });

//     socketRef.current.on("connect_error", (err: any) => {
//       console.error("Socket connection error:", err);
//       toast({
//         title: "Connection Error",
//         description:
//           "Failed to connect to the chat server. Please try again later.",
//         variant: "destructive",
//       });
//     });
//   }, [selectedUser?.id, session?.user?.id, toast]);

//   useEffect(() => {
//     fetchUsers();
//     socketInitializer();
//     return () => {
//       socketRef.current?.disconnect();
//     };
//   }, [socketInitializer]);

//   useEffect(() => {
//     if (selectedUser) {
//       fetchMessages();
//     }
//   }, [selectedUser]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   const fetchUsers = async () => {
//     try {
//       const response = await axios.get("/api/user");
//       setUsers(
//         response.data.data.filter((user: User) => user.id !== session?.user?.id)
//       );
//     } catch (error) {
//       console.error("Error fetching users:", error);
//       toast({
//         title: "Error",
//         description: "Failed to fetch users. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const fetchMessages = async () => {
//     if (session?.user?.id && selectedUser) {
//       setIsLoading(true);
//       try {
//         const response = await axios.get(
//           `/api/messages?senderId=${session.user.id}&receiverId=${selectedUser.id}`
//         );
//         const newMessages: Message[] = response.data.data;
//         setMessages(newMessages.reverse()); // Ensure the newest messages are at the bottom
//         scrollToBottom();
//       } catch (error) {
//         console.error("Error fetching messages:", error);
//         toast({
//           title: "Error",
//           description: "Failed to fetch messages. Please try again.",
//           variant: "destructive",
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   const handleSendMessage = () => {
//     if (
//       newMessage.trim() &&
//       session?.user?.id &&
//       selectedUser &&
//       socketRef.current
//     ) {
//       const messageData = {
//         content: newMessage,
//         senderId: session.user.id,
//         receiverId: selectedUser.id,
//       };

//       socketRef.current.emit(
//         "sendMessage",
//         messageData,
//         (acknowledgement: {
//           success: boolean;
//           message?: Message;
//           error?: string;
//         }) => {
//           if (acknowledgement.success && acknowledgement.message) {
//             // Ensure that we are adding only a valid message
//             setMessages((prevMessages) => [
//               ...prevMessages,
//               ...(acknowledgement.message ? [acknowledgement.message] : []),
//             ]);
//             setNewMessage("");
//             scrollToBottom();
//           } else {
//             console.error(
//               "Error sending message via Socket.IO:",
//               acknowledgement.error
//             );
//             sendMessageFallback(messageData);
//           }
//         }
//       );
//     } else {
//       toast({
//         title: "Error",
//         description: "Please select a user to send the message.",
//         variant: "destructive",
//       });
//     }
//   };

//   const sendMessageFallback = async (messageData: any) => {
//     try {
//       const response = await axios.post("/api/messages", messageData);
//       setMessages((prevMessages) => [...prevMessages, response.data]);
//       setNewMessage("");
//       scrollToBottom();
//     } catch (error) {
//       console.error("Error sending message via HTTP POST:", error);
//       toast({
//         title: "Error",
//         description: "Failed to send message. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleFileUpload = async (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = event.target.files?.[0];
//     if (file && session?.user?.id && selectedUser && socketRef.current) {
//       setIsLoading(true);
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("senderId", session.user.id);
//       formData.append("receiverId", selectedUser.id);

//       try {
//         const response = await axios.post(
//           "/api/messages/uploadFile",
//           formData,
//           {
//             headers: { "Content-Type": "multipart/form-data" },
//           }
//         );
//         if (response.data) {
//           socketRef.current.emit("sendMessage", response.data);
//           setMessages((prevMessages) => [...prevMessages, response.data]);
//           scrollToBottom();
//         }
//       } catch (error) {
//         console.error("Error uploading file:", error);
//         toast({
//           title: "Error",
//           description: "Failed to upload file. Please try again.",
//           variant: "destructive",
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   const renderMessage = (message: Message) => {
//     const isCurrentUser = message.senderId === session?.user?.id;
//     return (
//       <div
//         key={message.id}
//         className={`flex ${
//           isCurrentUser ? "justify-end" : "justify-start"
//         } mb-4`}
//       >
//         {!isCurrentUser && (
//           <Avatar className="w-8 h-8 mr-2">
//             <AvatarImage src={message.sender.profileImage || undefined} />
//             <AvatarFallback>
//               {message.sender.username ? message.sender.username[0] : "?"}
//             </AvatarFallback>
//           </Avatar>
//         )}
//         <div
//           className={`max-w-[70%] p-3 rounded-lg ${
//             isCurrentUser ? "bg-[#00E676] text-white" : "bg-gray-200"
//           }`}
//         >
//           {message.content}
//           {message.fileUrl && (
//             <a
//               href={message.fileUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="block text-blue-600"
//             >
//               Download File
//             </a>
//           )}
//           <div className="text-xs text-gray-500 mt-1">
//             {new Date(message.createdAt).toLocaleString()}
//           </div>
//         </div>
//         {isCurrentUser && (
//           <Avatar className="w-8 h-8 ml-2">
//             <AvatarImage src={session?.user?.image || undefined} />
//             <AvatarFallback>
//               {session?.user?.name ? session.user.name[0] : "?"}
//             </AvatarFallback>
//           </Avatar>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="flex flex-col h-screen">
//       <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
//         <h1 className="text-xl">Chat</h1>
//         <Button variant="outline">
//           <Phone className="mr-2" />
//           Call
//         </Button>
//         <Button variant="outline">
//           <Video className="mr-2" />
//           Video
//         </Button>
//       </header>
//       <div className="flex flex-1">
//         <aside className="w-1/4 border-r">
//           <ul>
//             {users.map((user) => (
//               <li
//                 key={user.id}
//                 className={`cursor-pointer p-4 hover:bg-gray-200 ${
//                   selectedUser?.id === user.id ? "bg-gray-300" : ""
//                 }`}
//                 onClick={() => setSelectedUser(user)}
//               >
//                 <div className="flex items-center">
//                   <Avatar className="w-8 h-8 mr-2">
//                     <AvatarImage src={user.profileImage || undefined} />
//                     <AvatarFallback>
//                       {user.username ? user.username[0] : "?"}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <p className="font-medium">{user.username}</p>
//                     <p className="text-sm text-gray-500">{user.status}</p>
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </aside>
//         <section className="w-3/4 flex flex-col">
//           <ScrollArea className="flex-1 p-4">
//             {isLoading ? (
//               <p>Loading messages...</p>
//             ) : (
//               messages.map((message) => renderMessage(message))
//             )}
//             <div ref={messagesEndRef}></div>
//           </ScrollArea>
//           <div className="p-4 border-t">
//             <div className="flex items-center">
//               <Input
//                 type="text"
//                 placeholder="Type your message..."
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 className="flex-1"
//               />
//               <Button
//                 variant="outline"
//                 onClick={handleSendMessage}
//                 disabled={!newMessage.trim()}
//               >
//                 <Send className="ml-2" />
//               </Button>
//               <input
//                 type="file"
//                 className="hidden"
//                 id="fileUpload"
//                 onChange={handleFileUpload}
//               />
//               <label htmlFor="fileUpload">
//                 <Button variant="outline">
//                   <Plus className="ml-2" />
//                 </Button>
//               </label>
//             </div>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }
