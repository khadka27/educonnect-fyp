import type { Metadata } from "next"
import ChatDashboardClient from "src/components/admin/chat/chat-dashboard-client"

export const metadata: Metadata = {
  title: "Chat Management | EduConnect Admin",
  description: "Manage chat groups and messages on the EduConnect platform",
}

export default function ChatDashboardPage() {
  return <ChatDashboardClient />
}

