"use client"

import type React from "react"

import { useState, useEffect } from "react"
import axios from "axios"
import { Users, BookOpen, Calendar, CreditCard, FileText, ChevronUp, ChevronDown, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useAdmin, adminActions } from "@/context/admin-context"
import { Badge } from "src/components/ui/badge"
import { format, formatDistanceToNow } from "date-fns"

// Types
interface DashboardStats {
  totalUsers: number
  totalTeachers: number
  totalEvents: number
  totalBooks: number
  totalArticles: number
  totalPayments: number
  recentPayments: Payment[]
  recentUsers: User[]
  usersByRole: {
    role: string
    count: number
  }[]
  paymentsByStatus: {
    status: string
    count: number
  }[]
}

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

interface Payment {
  id: string
  transactionId: string
  amount: number
  status: string
  method: string
  createdAt: string
  user: {
    name: string
  }
  event: {
    title: string
  }
}

export default function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { dispatch } = useAdmin()

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        adminActions.setLoading(dispatch, true)
        const response = await axios.get<DashboardStats>("/api/admin/dashboard-stats")
        setStats(response.data)
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
        adminActions.addAlert(dispatch, "Failed to load dashboard statistics", "error")
      } finally {
        setLoading(false)
        adminActions.setLoading(dispatch, false)
      }
    }

    fetchDashboardStats()
  }, [dispatch])

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  // Format role names for display
  const formatRoleName = (role: string) => {
    return role.charAt(0) + role.slice(1).toLowerCase()
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<Users className="h-5 w-5" />}
          description={`Including ${stats?.totalTeachers || 0} teachers`}
          trend={12.5}
          color="blue"
        />

        <StatsCard
          title="Total Events"
          value={stats?.totalEvents || 0}
          icon={<Calendar className="h-5 w-5" />}
          description="Scheduled events"
          trend={5.3}
          color="green"
        />

        <StatsCard
          title="Total Books"
          value={stats?.totalBooks || 0}
          icon={<BookOpen className="h-5 w-5" />}
          description="Available in library"
          trend={15.7}
          color="amber"
        />

        <StatsCard
          title="Total Articles"
          value={stats?.totalArticles || 0}
          icon={<FileText className="h-5 w-5" />}
          description="Published articles"
          trend={9.4}
          color="purple"
        />

        <StatsCard
          title="Total Payments"
          value={stats?.totalPayments || 0}
          icon={<CreditCard className="h-5 w-5" />}
          description="Processed payments"
          trend={18.2}
          color="rose"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Users by Role Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>Distribution of users by role type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.usersByRole || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="role"
                    label={({ role, count, percent }) =>
                      `${formatRoleName(role)}: ${count} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {stats?.usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, formatRoleName(name as string)]} />
                  <Legend formatter={(value) => formatRoleName(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payments by Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Payments by Status</CardTitle>
            <CardDescription>Overview of payment statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.paymentsByStatus || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" tickFormatter={(value) => value.charAt(0) + value.slice(1).toLowerCase()} />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name, props) => [
                      value,
                      props.payload.status.charAt(0) + props.payload.status.slice(1).toLowerCase(),
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Number of Payments" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{payment.transactionId}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.user.name} - {payment.event.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{format(new Date(payment.createdAt), "PPp")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{payment.amount}</p>
                    <Badge
                      variant={
                        payment.status === "COMPLETED"
                          ? "success"
                          : payment.status === "PENDING"
                            ? "warning"
                            : "destructive"
                      }
                    >
                      {payment.status.charAt(0) + payment.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge
                    variant={user.role === "ADMIN" ? "destructive" : user.role === "TEACHER" ? "default" : "secondary"}
                  >
                    {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
  description: string
  trend: number
  color: "blue" | "green" | "amber" | "purple" | "rose"
}

function StatsCard({ title, value, icon, description, trend, color }: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-1 text-3xl font-semibold">{value.toLocaleString()}</h3>
          </div>
          <div className={`rounded-full p-3 ${colorClasses[color]}`}>{icon}</div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{description}</p>
          <p className={`flex items-center text-sm ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
            {trend >= 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {Math.abs(trend)}%
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

