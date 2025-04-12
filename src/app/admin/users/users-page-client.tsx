"use client";

import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { UsersTable } from "src/components/admin/users/users-table";
import { UsersTableFilters } from "src/components/admin/users/users-table-filters";
import { UserStatistics } from "src/components/admin/users/user-statistics";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, BarChart2, Users } from "lucide-react";
import { CreateUserDialog } from "src/components/admin/users/create-user-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "src/components/ui/tabs";

export default function UsersPageClient() {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [activeView, setActiveView] = useState<"table" | "stats">("table");
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle user creation success
  const handleUserCreated = () => {
    setIsCreateUserOpen(false);
    toast({
      title: "User created successfully",
      description: "The new user has been added to the system",
      variant: "success",
    });
    // Refresh the table
    router.refresh();
  };

  const handleExportData = () => {
    // In a real application, this would call an API endpoint to generate the export
    toast({
      title: "Exporting user data",
      description: "Your download will begin shortly",
      variant: "success",
    });

    // Simulate download delay
    setTimeout(() => {
      // Create a sample CSV
      const headers = ["ID", "Name", "Email", "Role", "Status", "Joined Date"];
      const sampleData = [
        [
          "1",
          "John Doe",
          "john@example.com",
          "Student",
          "Active",
          "2023-01-15",
        ],
        [
          "2",
          "Jane Smith",
          "jane@example.com",
          "Teacher",
          "Active",
          "2023-02-20",
        ],
        [
          "3",
          "Bob Johnson",
          "bob@example.com",
          "Admin",
          "Inactive",
          "2023-03-10",
        ],
      ];

      const csvContent = [
        headers.join(","),
        ...sampleData.map((row) => row.join(",")),
      ].join("\n");

      // Create a blob and download it
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "users_export.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          User Management
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsCreateUserOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="table" onClick={() => setActiveView("table")}>
            <Users className="mr-2 h-4 w-4" />
            User List
          </TabsTrigger>
          <TabsTrigger value="stats" onClick={() => setActiveView("stats")}>
            <BarChart2 className="mr-2 h-4 w-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4 mt-4">
          <UsersTableFilters />
          <UsersTable />
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <UserStatistics />
        </TabsContent>
      </Tabs>

      <CreateUserDialog
        open={isCreateUserOpen}
        onOpenChange={setIsCreateUserOpen}
        onSuccess={handleUserCreated}
      />
    </div>
  );
}
