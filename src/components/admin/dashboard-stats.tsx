"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card"
import { Users, BookOpen, GraduationCap, Activity } from "lucide-react"
import { useState, useEffect } from "react"

interface StatsData {
  totalUsers: number
  totalCourses: number
  totalTeachers: number
  activeUsers: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalCourses: 0,
    totalTeachers: 0,
    activeUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch stats
    setTimeout(() => {
      setStats({
        totalUsers: 1254,
        totalCourses: 87,
        totalTeachers: 42,
        activeUsers: 876,
      })
      setLoading(false)
    }, 1000)
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Users"
        value={stats.totalUsers}
        description="Total registered users"
        icon={Users}
        loading={loading}
        trend="+12.5%"
        trendUp={true}
      />
      <StatsCard
        title="Total Courses"
        value={stats.totalCourses}
        description="Available courses"
        icon={BookOpen}
        loading={loading}
        trend="+4.3%"
        trendUp={true}
      />
      <StatsCard
        title="Teachers"
        value={stats.totalTeachers}
        description="Registered teachers"
        icon={GraduationCap}
        loading={loading}
        trend="+2.1%"
        trendUp={true}
      />
      <StatsCard
        title="Active Users"
        value={stats.activeUsers}
        description="Users active today"
        icon={Activity}
        loading={loading}
        trend="-3.2%"
        trendUp={false}
      />
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: number
  description: string
  icon: React.ElementType
  loading: boolean
  trend: string
  trendUp: boolean
}

function StatsCard({ title, value, description, icon: Icon, loading, trend, trendUp }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-9 w-24 animate-pulse rounded-md bg-muted"></div>
        ) : (
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
        {!loading && (
          <div className={`mt-2 text-xs ${trendUp ? "text-green-500" : "text-red-500"}`}>{trend} from last month</div>
        )}
      </CardContent>
    </Card>
  )
}

