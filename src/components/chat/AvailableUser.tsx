import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import { Button } from "src/components/ui/button";
import { ScrollArea } from "src/components/ui/scroll-area";

interface User {
  id: string;
  name: string;
  username: string;
  profileImage: string | null;
}

interface AvailableUsersProps {
  onSelectUser: (userId: string) => void;
}

export function AvailableUsers({ onSelectUser }: AvailableUsersProps) {
  const [users, setUsers] = useState<User[]>([]);
  const { data: session, status } = useSession(); // Status will indicate if session is loading

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/user");
        const allUsers = response.data.data; // Access the users array
        console.log("API Response (all users):", allUsers);
  
        if (Array.isArray(allUsers)) {
          if (session?.user?.id) {
            const availableUsers = allUsers.filter(
              (user: User) => user.id !== session.user.id
            );
            console.log("Filtered Users (excluding current user):", availableUsers);
            setUsers(availableUsers);
          } else {
            console.log("Session user ID not available yet, setting all users.");
            setUsers(allUsers); // If session isn't ready, display all users
          }
        } else {
          console.error("Expected an array of users but got:", allUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
  
    if (status === "authenticated") {
      fetchUsers();
    }
  }, [session, status]);
  

  if (status === "loading") {
    return <div>Loading...</div>; // Loading state while session is not ready
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] p-4 border-r">
      <h2 className="text-lg font-semibold mb-4">Available Users</h2>
      <div className="space-y-4">
        {users.length > 0 ? (
          users.map((user) => (
            <Button
              key={user.id}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => onSelectUser(user.id)}
            >
              <Avatar className="w-10 h-10 mr-3">
                <AvatarImage src={user.profileImage || undefined} />
                <AvatarFallback>{user.username ? user.username[0] : "?"}</AvatarFallback>              </Avatar>
              <span>{user.username}</span>
            </Button>
          ))
        ) : (
          <p>No users available</p> // Handle case where no users are available
        )}
      </div>
    </ScrollArea>
  );
}
