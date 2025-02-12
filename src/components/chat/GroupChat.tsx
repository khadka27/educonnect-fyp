import React, { useEffect, useState, useCallback } from "react";
import io from "socket.io-client";
import { useSession } from "next-auth/react";
import { Input } from "src/components/ui/input";
import { Button } from "src/components/ui/button";

const socket = io(); // Connect to the socket server

interface Group {
  id: string;
  name: string;
  adminId: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  groupId: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const GroupChat: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMessages, setGroupMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const { data: session } = useSession(); // Assuming session gives access to the user ID and role

  useEffect(() => {
    // Join socket room for real-time updates
    if (session?.user?.id) {
      socket.emit("joinRoom", session.user.id);

      socket.on("groupCreated", (group: Group) => {
        setGroups((prev) => [...prev, group]);
      });

      socket.on("newGroupMessage", (message: Message) => {
        setGroupMessages((prev) => [...prev, message]);
      });

      return () => {
        // Clean up socket listeners to prevent memory leaks
        socket.off("groupCreated");
        socket.off("newGroupMessage");
      };
    }
  }, [session]);

  const fetchGroupMessages = useCallback(
    (groupId: string) => {
      setSelectedGroup(groups.find((group) => group.id === groupId) || null);
      socket.emit("fetchGroupMessages", groupId);

      socket.on("groupMessageHistory", (messages: Message[]) => {
        setGroupMessages(messages);
      });

      return () => {
        socket.off("groupMessageHistory");
      };
    },
    [groups]
  );

  const createGroup = () => {
    if (groupName.trim() && session?.user?.id) {
      socket.emit("createGroup", {
        teacherId: session.user.id,
        groupName,
      });
      setGroupName(""); // Clear input
    }
  };

  const addUserToGroup = () => {
    if (selectedUser && selectedGroup) {
      socket.emit("addUserToGroup", {
        teacherId: session?.user.id,
        groupId: selectedGroup.id,
        userId: selectedUser,
      });

      // Clear selection after adding
      setSelectedUser(null);
    } else {
      console.error("No user or group selected.");
    }
  };

  const handleSendGroupMessage = () => {
    if (newMessage.trim() && selectedGroup && session?.user?.id) {
      socket.emit("sendGroupMessage", {
        content: newMessage,
        senderId: session.user.id,
        groupId: selectedGroup.id,
      });
      setNewMessage("");
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/user"); // Ensure this endpoint returns an array of users
        const data = await response.json();

        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("API did not return an array of users.");
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Group Chat</h1>

      {/* Create group */}
      <div className="mt-4">
        <h2 className="font-semibold">Create Group</h2>
        <Input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
        />
        <Button onClick={createGroup} className="mt-2">
          Create Group
        </Button>
      </div>

      {/* List of groups */}
      <div className="mt-6">
        <h2 className="font-semibold">Groups</h2>
        {groups.length > 0 ? (
          groups.map((group) => (
            <div
              key={group.id}
              className="p-2 border rounded cursor-pointer mt-2"
              onClick={() => fetchGroupMessages(group.id)}
            >
              {group.name}
            </div>
          ))
        ) : (
          <p>No groups available. Create one to get started.</p>
        )}
      </div>

      {/* Group members */}
      {selectedGroup && (
        <div className="mt-6">
          <h2 className="font-semibold">Add Users to {selectedGroup.name}</h2>
          <select
            value={selectedUser || ""}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="mt-2 p-2 border rounded"
          >
            <option value="" disabled>
              Select a user to add
            </option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <Button onClick={addUserToGroup} className="mt-2">
            Add User
          </Button>
        </div>
      )}

      {/* Group chat */}
      {selectedGroup && (
        <div className="mt-6">
          <h2 className="font-semibold">Chat in {selectedGroup.name}</h2>
          <div className="border p-4 h-64 overflow-y-auto">
            {groupMessages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 p-2 rounded ${
                  msg.senderId === session?.user?.id
                    ? "bg-blue-100 text-right"
                    : "bg-gray-100"
                }`}
              >
                <p>{msg.content}</p>
                <small className="text-gray-500">
                  {new Date(msg.createdAt).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
          <div className="mt-2 flex">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && handleSendGroupMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendGroupMessage} className="ml-2">
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChat;
