"use client";

import { useEffect, useState } from "react";
import {
  UserPlus,
  ChevronDown,
  Settings,
  Edit,
  Trash2,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import { Button } from "src/components/ui/button";
import { ScrollArea } from "src/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog";
import { Input } from "src/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface Group {
  id: string;
  name: string;
  adminId: string;
  avatar?: string;
  members: User[];
}

interface Props {
  selectedGroup: Group | null;
  currentUser: User | null;
}

const GroupDetails: React.FC<Props> = ({ selectedGroup, currentUser }) => {
  const [groupDetails, setGroupDetails] = useState<Group | null>(selectedGroup);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  const isAdmin = currentUser?.id === groupDetails?.adminId;
  const isTeacher = currentUser?.role === "TEACHER";

  // Update local group state when prop changes.
  useEffect(() => {
    setGroupDetails(selectedGroup);
    if (selectedGroup) {
      // Join the group room to receive updates.
      socket.emit("joinGroup", selectedGroup.id);
    }
  }, [selectedGroup]);

  // Listen for socket events related to group updates.
  useEffect(() => {
    // When the group is renamed.
    const handleGroupRenamed = ({
      groupId,
      newGroupName,
    }: {
      groupId: string;
      newGroupName: string;
    }) => {
      if (groupDetails && groupDetails.id === groupId) {
        setGroupDetails({ ...groupDetails, name: newGroupName });
      }
    };

    // When a new user is added.
    const handleUserAdded = ({
      groupId,
      userId,
    }: {
      groupId: string;
      userId: string;
    }) => {
      if (groupDetails && groupDetails.id === groupId) {
        // Look up the full user details from the users list.
        const newUser = users.find((u) => u.id === userId);
        if (
          newUser &&
          !groupDetails.members.some((member) => member.id === userId)
        ) {
          setGroupDetails({
            ...groupDetails,
            members: [...groupDetails.members, newUser],
          });
        }
      }
    };

    // When a user is removed (either kicked or left).
    const handleUserRemoved = ({
      groupId,
      userId,
    }: {
      groupId: string;
      userId: string;
    }) => {
      // Use the functional form to always get the latest state.
      setGroupDetails((prevGroup) =>
        prevGroup && prevGroup.id === groupId
          ? {
              ...prevGroup,
              members: prevGroup.members.filter(
                (member) => member.id !== userId
              ),
            }
          : prevGroup
      );
    };

    socket.on("groupRenamed", handleGroupRenamed);
    socket.on("userAddedToGroup", handleUserAdded);
    socket.on("userKickedFromGroup", handleUserRemoved);
    socket.on("userLeftGroup", handleUserRemoved);

    return () => {
      socket.off("groupRenamed", handleGroupRenamed);
      socket.off("userAddedToGroup", handleUserAdded);
      socket.off("userKickedFromGroup", handleUserRemoved);
      socket.off("userLeftGroup", handleUserRemoved);
    };
  }, [groupDetails, users]);

  // Fetch users on mount.
  useEffect(() => {
    socket.emit("fetchUsers");
    socket.on("userList", (data: User[]) => setUsers(data));

    return () => {
      socket.off("userList");
    };
  }, []);

  const handleAddMember = () => {
    if (!selectedUser || !groupDetails) return;

    socket.emit("addUserToGroup", {
      adminId: currentUser?.id,
      groupId: groupDetails.id,
      userId: selectedUser,
    });

    toast({
      title: "User added",
      description: "Member has been successfully added to the group.",
      variant: "success",
    });

    setIsAddMemberOpen(false);
    setSelectedUser(null);
  };

  const handleRenameGroup = () => {
    if (!groupDetails) return;
    const newGroupName = prompt("Enter new group name", groupDetails.name);
    if (newGroupName) {
      socket.emit("renameGroup", {
        adminId: currentUser?.id,
        groupId: groupDetails.id,
        newGroupName,
      });
      toast({
        title: "Group renamed",
        description: `Group renamed to ${newGroupName}`,
        variant: "success",
      });
      // Optionally, update immediately or wait for server event.
      // setGroupDetails({ ...groupDetails, name: newGroupName });
    }
  };

  const handleKickUser = (userId: string) => {
    if (!groupDetails) return;
    socket.emit("kickUserFromGroup", {
      adminId: currentUser?.id,
      groupId: groupDetails.id,
      userId,
    });

    toast({
      title: "User removed",
      description: "Member has been removed from the group.",
      variant: "error",
    });
  };

  const handleLeaveGroup = () => {
    if (!groupDetails) return;
    socket.emit("leaveGroup", {
      userId: currentUser?.id,
      groupId: groupDetails.id,
    });

    toast({
      title: "Left group",
      description: "You have left the group.",
      variant: "error",
    });
  };

  return (
    <div className="w-1/4 min-w-[300px] border-l border-gray-200 dark:border-gray-700 p-4 hidden md:block">
      {groupDetails ? (
        <>
          {/* Group Header */}
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-20 h-20">
              <AvatarImage src={groupDetails.avatar ?? "/placeholder.svg"} />
              <AvatarFallback>{groupDetails.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold mt-2">{groupDetails.name}</h2>
            <p className="text-sm text-gray-500">Group Details</p>
          </div>

          {/* Settings Button */}
          <div className="flex justify-end mt-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                {isAdmin && (
                  <Button
                    className="w-full flex items-center"
                    onClick={handleRenameGroup}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Rename Group
                  </Button>
                )}
                {groupDetails.members.length > 1 && (
                  <Button
                    className="w-full flex items-center text-red-500"
                    onClick={handleLeaveGroup}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Leave Group
                  </Button>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Members Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                Members ({groupDetails.members.length})
              </h3>
              <ChevronDown
                className="h-5 w-5 text-gray-500 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
              />
            </div>

            {isTeacher && (
              <button
                className="flex items-center text-blue-500 hover:underline mt-2"
                onClick={() => setIsAddMemberOpen(true)}
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Add Member
              </button>
            )}

            {/* List of Members */}
            <ScrollArea className="h-[200px] mt-2">
              {groupDetails.members
                .slice(0, expanded ? groupDetails.members.length : 7)
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {user?.name?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="block font-medium">{user.name}</span>
                        <span className="text-xs text-gray-500">
                          {user.role === "TEACHER"
                            ? "Teacher (Admin)"
                            : "Student"}
                        </span>
                      </div>
                    </div>
                    {isAdmin && user.id !== groupDetails.adminId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleKickUser(user.id)}
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
            </ScrollArea>
          </div>

          {/* Add Member Dialog */}
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogHeader>
              <DialogTitle>Add Member</DialogTitle>
            </DialogHeader>
            <DialogContent>
              <select
                className="w-full p-2 border rounded"
                value={selectedUser || ""}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="" disabled>
                  Select a user
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <div className="flex justify-end mt-4">
                <Button onClick={handleAddMember}>Add Member</Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <p className="text-center text-gray-500">
          Select a group to view details
        </p>
      )}
    </div>
  );
};

export default GroupDetails;
