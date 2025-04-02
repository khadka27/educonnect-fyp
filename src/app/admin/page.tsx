import type { Metadata } from "next";
import DashboardClient from "src/components/admin/dashboard-client";

export const metadata: Metadata = {
  title: "Admin Dashboard | EduConnect",
  description: "Overview of platform statistics and recent activity",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
