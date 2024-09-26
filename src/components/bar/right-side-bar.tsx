// "use client";

// import React, { useEffect, useState } from "react"; // Add useEffect
// import axios from "axios"; // Import Axios
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Smile,
//   Paperclip,
//   Send,
//   Minimize2,
//   Maximize2,
//   Menu,
//   Image,
//   Video,
//   File,
// } from "lucide-react";
// import EmojiPicker from "emoji-picker-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import Link from "next/link";

// interface User {
//   id: string;
//   name: string;
//   profileImage: string;
//   username: string;
// }
// interface MessageBox {
//   user: User;
//   isMinimized: boolean;
//   message: string;
// }

// const RightSidebar: React.FC = () => {
//   const [messageBoxes, setMessageBoxes] = useState<MessageBox[]>([]);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
//   const [users, setUsers] = useState<User[]>([]); // State for users

//   // Fetch users from the API
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await axios.get("/api/user"); // Fetch users from API
//         if (response.data.success) {
//           setUsers(response.data.data); // Set users in state
//         } else {
//           console.error("Failed to fetch users:", response.data.message);
//         }
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       }
//     };

//     fetchUsers(); // Call the fetch function
//   }, []);

//   const handleUserClick = (user: User) => {
//     const existingBox = messageBoxes.find((box) => box.user.id === user.id);
//     if (existingBox) {
//       setMessageBoxes(
//         messageBoxes.map((box) =>
//           box.user.id === user.id ? { ...box, isMinimized: false } : box
//         )
//       );
//     } else if (messageBoxes.length < 3) {
//       setMessageBoxes([
//         ...messageBoxes,
//         { user, isMinimized: false, message: "" },
//       ]);
//     }
//   };

//   const handleCloseMessageBox = (userId: string) => {
//     setMessageBoxes(messageBoxes.filter((box) => box.user.id !== userId));
//   };

//   const handleMinimizeMessageBox = (userId: string) => {
//     setMessageBoxes(
//       messageBoxes.map((box) =>
//         box.user.id === userId ? { ...box, isMinimized: !box.isMinimized } : box
//       )
//     );
//   };

//   const handleSendMessage = (userId: string) => {
//     setMessageBoxes(
//       messageBoxes.map((box) => {
//         if (box.user.id === userId && box.message.trim()) {
//           console.log(`Sending message to ${box.user.name}: ${box.message}`);
//           return { ...box, message: "" };
//         }
//         return box;
//       })
//     );
//   };

//   const handleMessageChange = (userId: string, message: string) => {
//     setMessageBoxes(
//       messageBoxes.map((box) =>
//         box.user.id === userId ? { ...box, message } : box
//       )
//     );
//   };

//   const handleEmojiClick = (userId: string, emojiObject: any) => {
//     setMessageBoxes(
//       messageBoxes.map((box) =>
//         box.user.id === userId
//           ? { ...box, message: box.message + emojiObject.emoji }
//           : box
//       )
//     );
//     setShowEmojiPicker(null);
//   };

//   return (
//     <>
//       <div className="fixed right-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col">
//         {/* User list */}
//         <div className="flex-grow overflow-y-auto p-4 space-y-4">
//           {users.map((user) => (
//             <div
//               key={user.id}
//               className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg"
//               onClick={() => handleUserClick(user)}
//             >
//                <Link
//                   href={`/user-profile/${user.id}`}
//                   className="flex items-center space-x-2"
//                 >
//               <Avatar>
//                 <AvatarImage src={user.profileImage} alt={user.name} />
//                 <AvatarFallback>
//                   {user.name ? user.name.charAt(0) : "?"}
//                 </AvatarFallback>
//               </Avatar>
//               </Link>
//               <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
//                 {user.name || user.username}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Message boxes */}
//       <div className="fixed bottom-0 right-64 flex space-x-4">
//         {messageBoxes.map((box, index) => (
//           <div
//             key={box.user.id}
//             className={`w-80 bg-white dark:bg-gray-800 shadow-lg rounded-t-lg overflow-hidden transition-all duration-300 ease-in-out ${
//               box.isMinimized ? "h-12" : "h-96"
//             }`}
//             style={{ right: `${index * 320 + 256}px` }}
//           >
//             <div className="flex items-center justify-between p-3 bg-green-500 dark:bg-green-600 text-white">
//               <div className="flex items-center space-x-2">
//                 {/* <Avatar className="h-8 w-8">
//                   <AvatarImage
//                     src={box.user.profileImage}
//                     alt={box.user.username}
//                   />
//                   <AvatarFallback>{box.user.username.charAt(0)}</AvatarFallback>
//                 </Avatar> */}

//                 <Link
//                   href={`/user-profile/${box.user.id}`}
//                   className="flex items-center space-x-2"
//                 >
//                   <Avatar className="h-8 w-8">
//                     <AvatarImage
//                       src={box.user.profileImage || "https://i.pravatar.cc/150"}
//                       alt={box.user.username || "User"}
//                     />
//                     <AvatarFallback>
//                       {box.user.username ? box.user.username.charAt(0) : "?"}
//                     </AvatarFallback>
//                   </Avatar>
//                   {/* <span className="font-medium">
//                     {box.user.username || "Unnamed User"}
//                   </span> */}
//                 </Link>
//                 <span className="font-medium">
//                   {box.user.name || box.user.username}
//                 </span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => handleMinimizeMessageBox(box.user.id)}
//                   className="text-white hover:text-gray-200"
//                 >
//                   {box.isMinimized ? (
//                     <Maximize2 size={18} />
//                   ) : (
//                     <Minimize2 size={18} />
//                   )}
//                 </button>
//                 <button
//                   onClick={() => handleCloseMessageBox(box.user.id)}
//                   className="text-white hover:text-gray-200"
//                 >
//                   <Minimize2 size={18} />
//                 </button>
//               </div>
//             </div>
//             {!box.isMinimized && (
//               <>
//                 <div className="h-64 p-4 overflow-y-auto">
//                   {/* Message history would go here */}
//                 </div>
//                 <div className="p-3 bg-gray-100 dark:bg-gray-700">
//                   <div className="flex items-center space-x-2">
//                     <Input
//                       type="text"
//                       placeholder="Type a message..."
//                       value={box.message}
//                       onChange={(e) =>
//                         handleMessageChange(box.user.id, e.target.value)
//                       }
//                       className="flex-grow"
//                     />
//                     <div className="relative">
//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         onClick={() =>
//                           setShowEmojiPicker(
//                             showEmojiPicker === box.user.id ? null : box.user.id
//                           )
//                         }
//                       >
//                         <Smile className="h-5 w-5 text-gray-500 dark:text-gray-400" />
//                       </Button>
//                       {showEmojiPicker === box.user.id && (
//                         <div className="absolute bottom-full right-0 mb-2">
//                           <EmojiPicker
//                             onEmojiClick={(emojiObject) =>
//                               handleEmojiClick(box.user.id, emojiObject)
//                             }
//                           />
//                         </div>
//                       )}
//                     </div>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button size="icon" variant="ghost">
//                           <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//                         <DropdownMenuItem>
//                           <Image className="mr-2 h-4 w-4" />
//                           <span>Add Image</span>
//                         </DropdownMenuItem>
//                         <DropdownMenuItem>
//                           <Video className="mr-2 h-4 w-4" />
//                           <span>Add Video</span>
//                         </DropdownMenuItem>
//                         <DropdownMenuItem>
//                           <File className="mr-2 h-4 w-4" />
//                           <span>Add File</span>
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                     <Button
//                       size="icon"
//                       onClick={() => handleSendMessage(box.user.id)}
//                     >
//                       <Send className="h-5 w-5" />
//                     </Button>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Mobile menu button */}
//       <div className="fixed top-3 right-3">
//         <Button
//           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//           variant="outline"
//         >
//           <Menu />
//         </Button>
//       </div>
//     </>
//   );
// };

// export default RightSidebar;


"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Smile,
  Paperclip,
  Send,
  Minimize2,
  Maximize2,
  Menu,
  Image,
  Video,
  File,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { io } from "socket.io-client"; // Import Socket.IO client
import { useSession } from "next-auth/react";

interface User {
  id: string;
  name: string;
  profileImage: string;
  username: string;
}

interface Message {
  id: string; // Add an ID for the message
  senderId: string; 
  receiverId: string;
  content: string;
  createdAt: Date; // Store creation date
}

interface MessageBox {
  user: User;
  isMinimized: boolean;
  messages: Message[]; // Change to array of Message objects
  message: string;
}

const RightSidebar: React.FC = () => {
  const [messageBoxes, setMessageBoxes] = useState<MessageBox[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const { data: session } = useSession();
  const senderId = session?.user?.id;

  const socket = io("http://localhost:4000"); // Initialize the socket connection

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/user");
        if (response.data.success) {
          setUsers(response.data.data);
        } else {
          console.error("Failed to fetch users:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();

    // Listen for incoming messages
    socket.on("receiveMessage", (data) => {
      const { userId, message } = data;
      setMessageBoxes((prev) =>
        prev.map((box) =>
          box.user.id === userId
            ? { ...box, messages: [...box.messages, message] }
            : box
        )
      );
    });

    return () => {
      socket.off("receiveMessage"); // Clean up the listener on component unmount
    };
  }, []);

  const handleUserClick = async (user: User) => {
    const existingBox = messageBoxes.find((box) => box.user.id === user.id);
    
    if (existingBox) {
      setMessageBoxes(
        messageBoxes.map((box) =>
          box.user.id === user.id ? { ...box, isMinimized: false } : box
        )
      );
    } else if (messageBoxes.length < 3) {
      // Fetch existing messages when opening a chat box
      const senderId = session?.user?.id; // Use the senderId from the session
      const receiverId = user.id;
      console.log("Fetching messages for:", senderId, receiverId);
      if (!senderId || !receiverId) {
        console.error("Missing senderId or receiverId");
        return; // Don't proceed if IDs are missing
      }
     
  
      try {
        const response = await axios.get(`/api/messages/fetchMessages`, {
          params: {
            senderId,  // Make sure to include senderId
            receiverId, // Include receiverId from the clicked user
          },
        });
        
        const fetchedMessages = response.data.messages;
        setMessageBoxes((prev) => [
          ...prev,
          { user, isMinimized: false, messages: fetchedMessages, message: "" },
        ]);
      } catch (error) {
        console.error("Error fetching messages:", error);
        // Check if error response contains a message
        if (axios.isAxiosError(error) && error.response && error.response.data) {
          if (axios.isAxiosError(error) && error.response) {
            console.error("Error response:", error.response.data);
          } else {
            console.error("Unexpected error:", error);
          }
        }
      }
    }
  };
  
  

  const handleCloseMessageBox = (userId: string) => {
    setMessageBoxes(messageBoxes.filter((box) => box.user.id !== userId));
  };

  const handleMinimizeMessageBox = (userId: string) => {
    setMessageBoxes(
      messageBoxes.map((box) =>
        box.user.id === userId ? { ...box, isMinimized: !box.isMinimized } : box
      )
    );
  };

  const handleSendMessage = async (userId: string) => {
    const box = messageBoxes.find((box) => box.user.id === userId);
    if (box && box.message.trim()) {
      const message = {
        senderId: senderId, // Replace with the actual sender ID
        receiverId: userId,
        content: box.message,
        createdAt: new Date(), // Add creation date
      };

      // Emit the message to the server
      socket.emit("sendMessage", { userId, message });

      // Clear the message input
      setMessageBoxes(
        messageBoxes.map((box) =>
          box.user.id === userId ? { ...box, message: "" } : box
        )
      );
    }
  };

  const handleMessageChange = (userId: string, message: string) => {
    setMessageBoxes(
      messageBoxes.map((box) =>
        box.user.id === userId ? { ...box, message } : box
      )
    );
  };

  const handleEmojiClick = (userId: string, emojiObject: any) => {
    setMessageBoxes(
      messageBoxes.map((box) =>
        box.user.id === userId
          ? { ...box, message: box.message + emojiObject.emoji }
          : box
      )
    );
    setShowEmojiPicker(null);
  };

  return (
    <>
      <div className="fixed right-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col">
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg"
              onClick={() => handleUserClick(user)}
            >
              <Link
                href={`/user-profile/${user.id}`}
                className="flex items-center space-x-2"
              >
                <Avatar>
                  <AvatarImage src={user.profileImage} alt={user.name} />
                  <AvatarFallback>
                    {user.name ? user.name.charAt(0) : "?"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {user.name || user.username}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 right-64 flex space-x-4">
        {messageBoxes.map((box) => (
          <div
            key={box.user.id}
            className={`w-80 bg-white dark:bg-gray-800 shadow-lg rounded-t-lg overflow-hidden transition-all duration-300 ease-in-out ${
              box.isMinimized ? "h-12" : "h-96"
            }`}
            style={{ right: `${Number(box.user.id) * 320 + 256}px` }}
          >
            <div className="flex items-center justify-between p-3 bg-green-500 dark:bg-green-600 text-white">
              <div className="flex items-center space-x-2">
                <Link
                  href={`/user-profile/${box.user.id}`}
                  className="flex items-center space-x-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={box.user.profileImage || "https://i.pravatar.cc/150"}
                      alt={box.user.username || "User"}
                    />
                    <AvatarFallback>
                      {box.user.username ? box.user.username.charAt(0) : "?"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <span className="font-medium">
                  {box.user.name || box.user.username}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleMinimizeMessageBox(box.user.id)}
                  className="text-white hover:text-gray-200"
                >
                  {box.isMinimized ? (
                    <Maximize2 size={18} />
                  ) : (
                    <Minimize2 size={18} />
                  )}
                </button>
                <button
                  onClick={() => handleCloseMessageBox(box.user.id)}
                  className="text-white hover:text-gray-200"
                >
                  <Minimize2 size={18} />
                </button>
              </div>
            </div>
            {!box.isMinimized && (
              <>
                <div className="h-64 p-4 overflow-y-auto">
                  {box.messages.map((msg, index) => (
                    <div key={index} className="mb-2">
                      <span className="font-medium">{msg.senderId === "YOUR_USER_ID" ? "You" : box.user.name}: </span>
                      <span>{msg.content}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-700">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="Type a message..."
                      value={box.message}
                      onChange={(e) =>
                        handleMessageChange(box.user.id, e.target.value)
                      }
                      className="flex-grow"
                    />
                    <div className="relative">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          setShowEmojiPicker(
                            showEmojiPicker === box.user.id ? null : box.user.id
                          )
                        }
                      >
                        <Smile className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </Button>
                      {showEmojiPicker === box.user.id && (
                        <div className="absolute bottom-full right-0 mb-2">
                          <EmojiPicker
                            onEmojiClick={(emojiObject) =>
                              handleEmojiClick(box.user.id, emojiObject)
                            }
                          />
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Image className="mr-2 h-4 w-4" />
                          <span>Add Image</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Video className="mr-2 h-4 w-4" />
                          <span>Add Video</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <File className="mr-2 h-4 w-4" />
                          <span>Add File</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      size="icon"
                      onClick={() => handleSendMessage(box.user.id)}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="fixed top-3 right-3">
        <Button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          variant="outline"
        >
          <Menu />
        </Button>
      </div>
    </>
  );
};

export default RightSidebar;
