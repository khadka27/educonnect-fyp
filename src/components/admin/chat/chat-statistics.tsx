"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format, parseISO } from "date-fns"

interface ChatStatsProps {
  stats: {
    totalMessages: number
    totalGroups: number
    messagesByDay: Array<{ date: string; count: number }>
    topActiveUsers: Array<{
      id: string
      name: string
      username: string
      profileImage: string | null
      messageCount: number
    }>
    topActiveGroups: Array<{
      id: string
      name: string
      messageCount: number
    }>
    period: string
    dateRange: {
      start: string
      end: string
    }
  }
  onPeriodChange: (period: string) => void
  currentPeriod: string
}

export function ChatStatistics({ stats, onPeriodChange, currentPeriod }: ChatStatsProps) {
  // Format data for the chart
  const chartData = stats.messagesByDay.map((day) => ({
    date: format(parseISO(day.date), "MMM dd"),
    messages: day.count,
  }))

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Messages by Day Chart */}
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Message Activity</CardTitle>
            <CardDescription>Message volume over time</CardDescription>
          </div>
          <Select value={currentPeriod} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24h</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value) => [`${value} messages`, "Messages"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="messages" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Active Users */}
      <Card>
        <CardHeader>
          <CardTitle>Top Active Users</CardTitle>
          <CardDescription>Users with the most messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topActiveUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.profileImage || undefined} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
                <div className="text-sm font-medium">{user.messageCount} messages</div>
              </div>
            ))}

            {stats.topActiveUsers.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">No active users in this period</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Active Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Top Active Groups</CardTitle>
          <CardDescription>Groups with the most messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topActiveGroups.map((group) => (
              <div key={group.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{group.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{group.name}</p>
                  </div>
                </div>
                <div className="text-sm font-medium">{group.messageCount} messages</div>
              </div>
            ))}

            {stats.topActiveGroups.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">No active groups in this period</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

