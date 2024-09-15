"use client";


/* eslint-disable jsx-a11y/alt-text */
import React, { useState } from "react";
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

const users: User[] = [
  { id: "1", name: "Alice Johnson", avatar: "https://i.pravatar.cc/150?img=1" },
  { id: "2", name: "Bob Smith", avatar: "https://i.pravatar.cc/150?img=2" },
  { id: "3", name: "Charlie Brown", avatar: "https://i.pravatar.cc/150?img=3" },
  { id: "4", name: "Diana Prince", avatar: "https://i.pravatar.cc/150?img=4" },
  { id: "5", name: "Ethan Hunt", avatar: "https://i.pravatar.cc/150?img=5" },
  // Add more users to test scrolling
];

const RightSidebar: React.FC = () => {
  const [messageBoxes, setMessageBoxes] = useState<MessageBox[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  const handleUserClick = (user: User) => {
    const existingBox = messageBoxes.find((box) => box.user.id === user.id);
    if (existingBox) {
      setMessageBoxes(
        messageBoxes.map((box) =>
          box.user.id === user.id ? { ...box, isMinimized: false } : box
        )
      );
    } else if (messageBoxes.length < 3) {
      setMessageBoxes([
        ...messageBoxes,
        { user, isMinimized: false, message: "" },
      ]);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      {/* Mobile view */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-full shadow-lg"
        >
          <Menu size={24} />
        </button>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-white dark:bg-gray-800 z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-green-500 dark:bg-green-600 text-white">
              <span className="font-medium">Contacts</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <Minimize2 size={18} />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg"
                  onClick={() => {
                    handleUserClick(user);
                    setIsMobileMenuOpen(false);
                  }}
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
        )}

        {messageBoxes.length > 0 && !isMobileMenuOpen && (
          <div className="fixed inset-0 bg-white dark:bg-gray-800 z-40 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-green-500 dark:bg-green-600 text-white">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={messageBoxes[0].user.avatar}
                    alt={messageBoxes[0].user.name}
                  />
                  <AvatarFallback>
                    {messageBoxes[0].user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{messageBoxes[0].user.name}</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-white hover:text-gray-200"
              >
                <Menu size={24} />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4">
              {/* Message history would go here */}
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-700">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={messageBoxes[0].message}
                  onChange={(e) =>
                    handleMessageChange(messageBoxes[0].user.id, e.target.value)
                  }
                  className="flex-grow"
                />
                <div className="relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setShowEmojiPicker(
                        showEmojiPicker === messageBoxes[0].user.id
                          ? null
                          : messageBoxes[0].user.id
                      )
                    }
                  >
                    <Smile className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </Button>
                  {showEmojiPicker === messageBoxes[0].user.id && (
                    <div className="absolute bottom-full right-0 mb-2">
                      <EmojiPicker
                        onEmojiClick={(emojiObject) =>
                          handleEmojiClick(messageBoxes[0].user.id, emojiObject)
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
                  onClick={() => handleSendMessage(messageBoxes[0].user.id)}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RightSidebar;
