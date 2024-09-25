"use client";

import React, { useEffect, useState } from "react"; // Add useEffect
import axios from "axios"; // Import Axios
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

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface MessageBox {
  user: User;
  isMinimized: boolean;
  message: string;
}

const RightSidebar: React.FC = () => {
  const [messageBoxes, setMessageBoxes] = useState<MessageBox[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]); // State for users

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/users"); // Fetch users from API
        if (response.data.success) {
          setUsers(response.data.data); // Set users in state
        } else {
          console.error("Failed to fetch users:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers(); // Call the fetch function
  }, []);

  const handleUserClick = (user: User) => {
    const existingBox = messageBoxes.find((box) => box.user.id === user.id);
    if (existingBox) {
      setMessageBoxes(
        messageBoxes.map((box) =>
          box.user.id === user.id ? { ...box, isMinimized: false } : box
        )
      );
    } else if (messageBoxes.length < 3) {
      setMessageBoxes([ ...messageBoxes, { user, isMinimized: false, message: "" } ]);
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

  const handleSendMessage = (userId: string) => {
    setMessageBoxes(
      messageBoxes.map((box) => {
        if (box.user.id === userId && box.message.trim()) {
          console.log(`Sending message to ${box.user.name}: ${box.message}`);
          return { ...box, message: "" };
        }
        return box;
      })
    );
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
        {/* User list */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg"
              onClick={() => handleUserClick(user)}
            >
              <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {user.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Message boxes */}
      <div className="fixed bottom-0 right-64 flex space-x-4">
        {messageBoxes.map((box, index) => (
          <div
            key={box.user.id}
            className={`w-80 bg-white dark:bg-gray-800 shadow-lg rounded-t-lg overflow-hidden transition-all duration-300 ease-in-out ${
              box.isMinimized ? "h-12" : "h-96"
            }`}
            style={{ right: `${index * 320 + 256}px` }}
          >
            <div className="flex items-center justify-between p-3 bg-green-500 dark:bg-green-600 text-white">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={box.user.avatar} alt={box.user.name} />
                  <AvatarFallback>{box.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{box.user.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleMinimizeMessageBox(box.user.id)}
                  className="text-white hover:text-gray-200"
                >
                  {box.isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
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
                  {/* Message history would go here */}
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

      {/* Mobile menu button */}
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
