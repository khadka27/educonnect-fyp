"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "src/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  MessageSquare,
  Users,
  PlusCircle,
  Loader2,
  FileImage,
  FileText,
  FileVideo,
  FileAudio,
} from "lucide-react";
import { useAdmin, adminActions } from "@/context/admin-context";
import { ChatStatistics } from "./chat-statistics";
import { GroupsList } from "./groups-list";
import { MessagesList } from "./messages-list";
import { CreateGroupDialog } from "./create-group-dialog";

interface ChatStats {
  totalMessages: number;
  totalGroups: number;
  messagesByDay: Array<{ date: string; count: number }>;
  topActiveUsers: Array<{
    id: string;
    name: string;
    username: string;
    profileImage: string | null;
    messageCount: number;
  }>;
  topActiveGroups: Array<{
    id: string;
    name: string;
    messageCount: number;
  }>;
  mediaStats: Array<{
    fileType: string | null;
    _count: number;
  }>;
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export default function ChatDashboardClient() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [period, setPeriod] = useState("week");

  const router = useRouter();
  const { dispatch } = useAdmin();

  useEffect(() => {
    const fetchChatStats = async () => {
      try {
        adminActions.setLoading(dispatch, true);
        setLoading(true);

        const response = await axios.get<ChatStats>(
          `/api/admin/chat?period=${period}`
        );
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching chat statistics:", error);
        adminActions.addAlert(
          dispatch,
          "Failed to fetch chat statistics",
          "error"
        );
      } finally {
        setLoading(false);
        adminActions.setLoading(dispatch, false);
      }
    };

    fetchChatStats();
  }, [period, dispatch]);

  const handleGroupCreated = () => {
    setIsCreateGroupOpen(false);
    adminActions.addAlert(dispatch, "Group created successfully", "success");
    router.refresh();
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
  };

  if (loading && !stats) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Chat Management</h1>
        <Button onClick={() => setIsCreateGroupOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <BarChart className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="groups">
            <Users className="mr-2 h-4 w-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Messages
                    </CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalMessages.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      In the past{" "}
                      {period === "day"
                        ? "24 hours"
                        : period === "week"
                        ? "7 days"
                        : period === "month"
                        ? "30 days"
                        : "year"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Groups
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalGroups.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active chat groups
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Media Messages
                    </CardTitle>
                    <FileImage className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.mediaStats
                        .reduce((sum, item) => sum + item._count, 0)
                        .toLocaleString()}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {stats.mediaStats.map((item) => {
                        const Icon =
                          item.fileType === "IMAGE"
                            ? FileImage
                            : item.fileType === "DOCUMENT"
                            ? FileText
                            : item.fileType === "VIDEO"
                            ? FileVideo
                            : item.fileType === "AUDIO"
                            ? FileAudio
                            : FileText;

                        return (
                          <div
                            key={item.fileType || "other"}
                            className="flex items-center gap-1 text-xs"
                          >
                            <Icon className="h-3 w-3" />
                            <span>{item._count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <ChatStatistics
                stats={stats}
                onPeriodChange={handlePeriodChange}
                currentPeriod={period}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="groups">
          <GroupsList />
        </TabsContent>

        <TabsContent value="messages">
          <MessagesList />
        </TabsContent>
      </Tabs>

      <CreateGroupDialog
        open={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
        onSuccess={handleGroupCreated}
      />
    </div>
  );
}
