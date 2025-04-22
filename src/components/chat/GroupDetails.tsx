"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import io from "socket.io-client";
import { cn } from "src/lib/utils";

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import { Button } from "src/components/ui/button";
import { ScrollArea } from "src/components/ui/scroll-area";
import { Badge } from "src/components/ui/badge";
import { Skeleton } from "src/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "src/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "src/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";

// Icons
import {
  UserPlus,
  ChevronDown,
  ChevronUp,
  Settings,
  Edit,
  Trash2,
  LogOut,
  Users,
  Search,
  X,
  Shield,
  User,
  Check,
} from "lucide-react";

// Initialize socket
const socket = io("http://localhost:3000");

// Types
interface UserType {
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
  members: UserType[];
}

interface Props {
  selectedGroup: Group | null;
  currentUser: UserType | null;
}

const GroupDetails: React.FC<Props> = ({ selectedGroup, currentUser }) => {
  // State
  const [groupDetails, setGroupDetails] = useState<Group | null>(selectedGroup);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Hooks
  const { toast } = useToast();
  const { theme } = useTheme();

  // Check if user is admin or teacher
  const isAdmin = currentUser?.id === groupDetails?.adminId;
  const isTeacher = currentUser?.role === "TEACHER";

  // Update local group state when prop changes
  useEffect(() => {
    setGroupDetails(selectedGroup);
    if (selectedGroup) {
      // Join the group room to receive updates
      socket.emit("joinGroup", selectedGroup.id);
    }
  }, [selectedGroup]);

  // Listen for socket events related to group updates
  useEffect(() => {
    // When the group is renamed
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

    // When a new user is added
    const handleUserAdded = ({
      groupId,
      userId,
    }: {
      groupId: string;
      userId: string;
    }) => {
      if (groupDetails && groupDetails.id === groupId) {
        // Look up the full user details from the users list
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

    // When a user is removed (either kicked or left)
    const handleUserRemoved = ({
      groupId,
      userId,
    }: {
      groupId: string;
      userId: string;
    }) => {
      // Use the functional form to always get the latest state
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

  // Fetch users on mount
  useEffect(() => {
    setIsLoading(true);
    socket.emit("fetchUsers");
    socket.on("userList", (data: UserType[]) => {
      setUsers(data);
      setFilteredUsers(data);
      setIsLoading(false);
    });

    return () => {
      socket.off("userList");
    };
  }, []);

  // Filter users when search query changes
  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  // Handlers

  // Add member to group
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
    });

    setIsAddMemberOpen(false);
    setSelectedUser(null);
  };

  // Rename group
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
      });
    }
  };

  // Kick user from group
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
      variant: "destructive",
    });
  };

  // Leave group
  const handleLeaveGroup = () => {
    if (!groupDetails) return;

    socket.emit("leaveGroup", {
      userId: currentUser?.id,
      groupId: groupDetails.id,
    });

    toast({
      title: "Left group",
      description: "You have left the group.",
      variant: "destructive",
    });
  };

  // Get available users (not already in the group)
  const getAvailableUsers = () => {
    if (!groupDetails) return filteredUsers;

    return filteredUsers.filter(
      (user) => !groupDetails.members.some((member) => member.id === user.id)
    );
  };

  return (
    <div className="p-4 h-full flex flex-col">
      {groupDetails ? (
        <>
          {/* Group Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar className="w-20 h-20 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
              <AvatarImage src={groupDetails.avatar ?? "/placeholder.svg"} />
              <AvatarFallback
                className={cn(theme === "dark" ? "bg-muted" : "bg-muted")}
              >
                {groupDetails.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-xl font-semibold mt-3">{groupDetails.name}</h2>

            <div className="flex items-center mt-1">
              <Badge variant="outline" className="text-xs">
                {groupDetails.members.length} members
              </Badge>

              {isAdmin && (
                <Badge
                  variant="outline"
                  className="ml-2 text-xs border-primary text-primary"
                >
                  Admin
                </Badge>
              )}
            </div>
          </div>

          {/* Settings Button */}
          <div className="flex justify-end mt-1 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Group Settings
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-2">
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleRenameGroup}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Rename Group
                    </Button>
                  )}

                  {isAdmin && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setIsAddMemberOpen(true)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" /> Add Members
                    </Button>
                  )}

                  {groupDetails.members.length > 1 && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive"
                      onClick={handleLeaveGroup}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Leave Group
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Members Section */}
          <div className="flex-1 overflow-hidden">
            <Collapsible
              open={expanded}
              onOpenChange={setExpanded}
              className="w-full"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Members
                </h3>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                    {expanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="overflow-hidden">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-1">
                    {groupDetails.members.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-md",
                          theme === "dark"
                            ? "hover:bg-muted/50"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={user.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback
                              className={cn(
                                theme === "dark" ? "bg-muted" : "bg-muted"
                              )}
                            >
                              {user?.name?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <div className="flex items-center">
                              <span className="font-medium text-sm">
                                {user.name}
                              </span>
                              {user.id === groupDetails.adminId && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Shield className="h-3.5 w-3.5 ml-1 text-primary" />
                                    </TooltipTrigger>
                                    <TooltipContent>Group Admin</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {user.id === currentUser?.id && (
                                <Badge
                                  variant="outline"
                                  className="ml-1 px-1 py-0 text-[10px]"
                                >
                                  You
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {user.role === "TEACHER" ? "Teacher" : "Student"}
                            </span>
                          </div>
                        </div>

                        {isAdmin &&
                          user.id !== groupDetails.adminId &&
                          user.id !== currentUser?.id && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => handleKickUser(user.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Remove from group
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Add Member Dialog */}
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Members</DialogTitle>
              </DialogHeader>

              <div className="relative my-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  className="w-full pl-9 pr-4 py-2 border rounded-md bg-background"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-full"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <ScrollArea className="h-60 mt-2">
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-2 p-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : getAvailableUsers().length > 0 ? (
                  getAvailableUsers().map((user) => (
                    <div
                      key={user.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md cursor-pointer",
                        selectedUser === user.id
                          ? "bg-primary/10"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedUser(user.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={user.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback
                            className={cn(
                              theme === "dark" ? "bg-muted" : "bg-muted"
                            )}
                          >
                            {user?.name?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <span className="font-medium">{user.name}</span>
                          <div className="flex items-center text-xs text-muted-foreground">
                            {user.role === "TEACHER" ? (
                              <>
                                <Shield className="h-3 w-3 mr-1" />
                                Teacher
                              </>
                            ) : (
                              <>
                                <User className="h-3 w-3 mr-1" />
                                Student
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "h-5 w-5 rounded-full border-2",
                          selectedUser === user.id
                            ? "bg-primary border-primary"
                            : "border-muted-foreground"
                        )}
                      >
                        {selectedUser === user.id && (
                          <Check className="h-4 w-4 text-primary-foreground" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No users available
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? `No results for "${searchQuery}"`
                        : "All users are already in this group"}
                    </p>
                  </div>
                )}
              </ScrollArea>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddMemberOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddMember} disabled={!selectedUser}>
                  Add to Group
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <div
            className={cn(
              "p-6 rounded-full mb-4",
              theme === "dark" ? "bg-muted" : "bg-muted"
            )}
          >
            <Users className="h-12 w-12 opacity-30" />
          </div>
          <p className="text-center text-muted-foreground">
            Select a group to view details
          </p>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
