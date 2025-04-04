"use client";

import type React from "react";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "src/components/ui/input";
import { Badge } from "src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  Eye,
  Trash,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useAdmin, adminActions } from "@/context/admin-context";
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import { DeleteMessageDialog } from "./delete-message-dialog";

interface Message {
  id: string;
  content: string;
  fileUrl: string | null;
  fileType: string | null;
  isRead: boolean;
  isGroupMessage: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    username: string;
    profileImage: string | null;
  };
  receiver?: {
    id: string;
    name: string;
    username: string;
    profileImage: string | null;
  } | null;
  group?: {
    id: string;
    name: string;
  } | null;
}

interface MessagesResponse {
  messages: Message[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export function MessagesList() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { dispatch } = useAdmin();

  const page = Number(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const hasFiles = searchParams.get("hasFiles") || "";

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);

        // Build query string
        const queryParams = new URLSearchParams();
        queryParams.set("page", page.toString());
        if (search) queryParams.set("search", search);
        if (hasFiles) queryParams.set("hasFiles", hasFiles);

        const response = await axios.get<MessagesResponse>(
          `/api/admin/chat/messages?${queryParams.toString()}`
        );

        setMessages(response.data.messages);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error("Error fetching messages:", error);
        adminActions.addAlert(dispatch, "Failed to fetch messages", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [page, search, hasFiles, dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    params.set("page", "1");

    router.push(`/admin/chat?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    router.push(`/admin/chat?${params.toString()}`);
  };

  const handleMessageDeleted = async () => {
    if (!messageToDelete) return;

    try {
      adminActions.setLoading(dispatch, true);
      await axios.delete(`/api/admin/chat/messages/${messageToDelete.id}`);

      setMessageToDelete(null);
      adminActions.addAlert(
        dispatch,
        "Message deleted successfully",
        "success"
      );
      router.refresh();
    } catch (error) {
      console.error("Error deleting message:", error);
      adminActions.addAlert(dispatch, "Failed to delete message", "error");
    } finally {
      adminActions.setLoading(dispatch, false);
    }
  };

  const handleViewMessage = (messageId: string) => {
    router.push(`/admin/chat/messages/${messageId}`);
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return null;

    switch (fileType.toUpperCase()) {
      case "IMAGE":
        return <FileImage className="h-4 w-4" />;
      case "DOCUMENT":
        return <FileText className="h-4 w-4" />;
      case "VIDEO":
        return <FileVideo className="h-4 w-4" />;
      case "AUDIO":
        return <FileAudio className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search messages..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sender</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No messages found.
                </TableCell>
              </TableRow>
            ) : (
              messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={message.sender.profileImage || undefined}
                          alt={message.sender.name}
                        />
                        <AvatarFallback>
                          {getInitials(message.sender.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{message.sender.name}</div>
                        <div className="text-xs text-muted-foreground">
                          @{message.sender.username}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {message.fileUrl && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          {getFileIcon(message.fileType)}
                          <span>File</span>
                        </Badge>
                      )}
                      <span className="line-clamp-1">
                        {truncateText(message.content, 50)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {message.isGroupMessage ? (
                      <Badge variant="secondary">
                        Group: {message.group?.name}
                      </Badge>
                    ) : (
                      message.receiver && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={message.receiver.profileImage || undefined}
                              alt={message.receiver.name}
                            />
                            <AvatarFallback>
                              {getInitials(message.receiver.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{message.receiver.name}</span>
                        </div>
                      )
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(message.createdAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleViewMessage(message.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setMessageToDelete(message)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
          {Math.min(
            pagination.currentPage * pagination.itemsPerPage,
            pagination.totalItems
          )}{" "}
          of {pagination.totalItems}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={
              pagination.currentPage >= pagination.totalPages || loading
            }
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>

      {messageToDelete && (
        <DeleteMessageDialog
          message={messageToDelete}
          open={!!messageToDelete}
          onOpenChange={() => setMessageToDelete(null)}
          onSuccess={handleMessageDeleted}
        />
      )}
    </div>
  );
}
