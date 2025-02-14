"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useSession } from "next-auth/react";
import { Input } from "src/components/ui/input";
import { Button } from "src/components/ui/button";
import { ScrollArea } from "src/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import { Card, CardContent, CardHeader } from "src/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import GroupDetails from "./GroupDetails";
import { Send } from "lucide-react";

const socket = io("http://localhost:3000");

// Extend the Message interface to include file properties.
interface Message {
  id: string;
  content: string;
  senderId: string;
  senderImage?: string;
  groupId: string;
  createdAt: string;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
}

interface Group {
  id: string;
  name: string;
  adminId: string;
  members: User[];
  avatar?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: string;
}

// Dialog component for file preview
interface FilePreviewDialogProps {
  fileUrl: string;
  fileType: string;
  fileName: string;
  onClose: () => void;
}

function FilePreviewDialog({
  fileUrl,
  fileType,
  fileName,
  onClose,
}: FilePreviewDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-3xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{fileName}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="mb-4">
          {fileType.match(/(jpg|jpeg|png|gif)/i) ? (
            <img src={fileUrl} alt={fileName} className="max-h-96 mx-auto" />
          ) : fileType === "pdf" ? (
            <embed
              src={fileUrl}
              type="application/pdf"
              className="w-full h-96"
            />
          ) : (
            <p>Preview is not available for this file type.</p>
          )}
        </div>
        <div className="flex justify-end">
          <a
            href={fileUrl}
            download={fileName}
            className="mr-2 text-blue-600 hover:underline"
          >
            Download
          </a>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

function GroupChat() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMessages, setGroupMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // State for file preview dialog.
  const [previewFile, setPreviewFile] = useState<{
    fileUrl: string;
    fileType: string;
    fileName: string;
  } | null>(null);
  const { data: session } = useSession();
  const toast = useToast();

  const isTeacher = session?.user?.role === "TEACHER";

  useEffect(() => {
    if (session?.user?.id) {
      socket.emit("fetchGroups", session.user.id);
      socket.on("groupList", (data: Group[]) => setGroups(data));

      socket.emit("fetchUsers");
      socket.on("userList", (data: User[]) => setUsers(data));

      // Listen for group creation (optimistic update)
      socket.on("groupCreated", (group: Group) => {
        setGroups((prev) => [group, ...prev]);
      });

      return () => {
        socket.off("groupList");
        socket.off("userList");
        socket.off("groupCreated");
      };
    }
  }, [session]);

  useEffect(() => {
    if (selectedGroup) {
      socket.emit("fetchGroupMessages", selectedGroup.id);
      socket.emit("joinGroup", selectedGroup.id);

      const handleGroupMessageHistory = (messages: Message[]) => {
        setGroupMessages(messages);
      };

      const handleNewGroupMessage = (message: Message) => {
        if (message.groupId === selectedGroup.id) {
          setGroupMessages((prevMessages) => {
            // Remove matching temporary message if found before adding the real one
            return prevMessages
              .filter(
                (msg) =>
                  !(
                    msg.id.startsWith("temp-") &&
                    msg.senderId === message.senderId &&
                    msg.content === message.content
                  )
              )
              .concat(message);
          });
        }
      };

      socket.on("groupMessageHistory", handleGroupMessageHistory);
      socket.on("newGroupMessage", handleNewGroupMessage);

      return () => {
        socket.off("groupMessageHistory", handleGroupMessageHistory);
        socket.off("newGroupMessage", handleNewGroupMessage);
      };
    }
  }, [selectedGroup]);

  const fetchGroupMessages = (groupId: string) => {
    const group = groups.find((group) => group.id === groupId) || null;
    setSelectedGroup(group);
    setGroupMessages([]);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedGroup && session?.user?.id) {
      const optimisticMessage: Message = {
        id: "temp-" + Date.now(),
        content: newMessage,
        senderId: session.user.id,
        groupId: selectedGroup.id,
        createdAt: new Date().toISOString(),
        senderImage: session.user.image ?? "/placeholder.svg",
      };
      setGroupMessages((prev) => [...prev, optimisticMessage]);

      socket.emit("sendGroupMessage", {
        content: newMessage,
        senderId: session.user.id,
        groupId: selectedGroup.id,
        senderImage: session.user.image ?? "/placeholder.svg",
      });
      setNewMessage("");
    }
  };

  const handleCreateGroup = () => {
    if (isTeacher && newGroupName.trim() && session?.user?.id) {
      const newGroup: Group = {
        id: "temp-" + Date.now(),
        name: newGroupName,
        adminId: session.user.id,
        members: [
          {
            id: session.user.id,
            name: session.user.name?.split(" ")[0] ?? "Teacher",
            email: session.user.email,
            avatar: session.user.image ?? "/placeholder.svg",
            role: session.user.role,
          },
        ],
        avatar: "/placeholder.svg",
      };
      setGroups((prev) => [newGroup, ...prev]);

      socket.emit("createGroup", {
        teacherId: session.user.id,
        groupName: newGroupName,
      });
      setNewGroupName("");
      toast.toast({
        variant: "destructive",
        title: "Group created successfully",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSendFile = () => {
    if (selectedFile && selectedGroup && session?.user?.id) {
      const fileExtension =
        selectedFile.name.split(".").pop()?.toLowerCase() || "";
      // Create an optimistic file message
      const optimisticMessage: Message = {
        id: "temp-" + Date.now(),
        content: `File: ${selectedFile.name}`,
        senderId: session.user.id,
        groupId: selectedGroup.id,
        createdAt: new Date().toISOString(),
        senderImage: session.user.image ?? "/placeholder.svg",
        fileName: selectedFile.name,
        fileType: fileExtension,
        fileUrl: "", // Temporary placeholder; real URL comes from server.
      };
      setGroupMessages((prev) => [...prev, optimisticMessage]);

      socket.emit("sendFile", {
        fileName: selectedFile.name,
        fileType: fileExtension,
        senderId: session.user.id,
        groupId: selectedGroup.id,
      });
      setSelectedFile(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Left Sidebar */}
      <div className="w-1/4 min-w-[300px] border-r border-gray-200 dark:border-gray-700 p-4 hidden md:block">
        <h2 className="text-xl font-bold">Messages</h2>
        {isTeacher && (
          <div className="flex mb-2">
            <Input
              placeholder="New group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <Button onClick={handleCreateGroup} className="ml-2">
              Create
            </Button>
          </div>
        )}
        <ScrollArea className="h-[calc(100vh-100px)]">
          {groups.map((group) => (
            <div
              key={group.id}
              className={`p-3 rounded-lg flex items-center justify-between cursor-pointer ${
                selectedGroup?.id === group.id
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => fetchGroupMessages(group.id)}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={group.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {group.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="block font-semibold">{group.name}</span>
                <span className="text-sm text-gray-500">
                  {group.members.length} members
                </span>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Section */}
      <div className="flex flex-col flex-1">
        <CardHeader className="flex flex-row border-b p-4 justify-between dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {selectedGroup && (
              <Avatar className="w-12 h-12">
                <AvatarImage src={selectedGroup.avatar ?? "/placeholder.svg"} />
                <AvatarFallback>
                  {selectedGroup.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <h2 className="text-lg font-semibold">
              {selectedGroup ? selectedGroup.name : "Select a group"}
            </h2>
          </div>
        </CardHeader>

        {/* Message Input */}
        <CardContent className="flex flex-col flex-1 p-4">
          <ScrollArea className="h-[calc(100vh-160px)] mb-2">
            {groupMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.senderId === session?.user?.id
                    ? "justify-end"
                    : "justify-start"
                } mb-3`}
              >
                <div className="ml-2 p-3 rounded-lg bg-gray-200 dark:bg-gray-800">
                  {/* Render file messages if fileUrl is provided */}
                  {msg.fileUrl ? (
                    <div
                      className="cursor-pointer"
                      onClick={() =>
                        setPreviewFile({
                          fileUrl: msg.fileUrl!,
                          fileType: msg.fileType || "",
                          fileName: msg.fileName || "File",
                        })
                      }
                    >
                      {msg.fileType &&
                      msg.fileType.match(/(jpg|jpeg|png|gif)/i) ? (
                        <img
                          src={msg.fileUrl}
                          alt={msg.fileName || "Image"}
                          className="max-h-40 rounded"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-600 underline">
                            View {msg.fileType === "pdf" ? "PDF" : "File"}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message"
              />
              <Button onClick={handleSendMessage}>
                <Send />
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              {/* Hidden file input */}
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                Attach File
              </Button>
              {selectedFile && (
                <>
                  <span className="text-sm">{selectedFile.name}</span>
                  <Button onClick={handleSendFile}>Send File</Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </div>
      <GroupDetails
        selectedGroup={selectedGroup}
        currentUser={session?.user ?? null}
      />
      {previewFile && (
        <FilePreviewDialog
          fileUrl={previewFile.fileUrl}
          fileType={previewFile.fileType}
          fileName={previewFile.fileName}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}

export default GroupChat;
