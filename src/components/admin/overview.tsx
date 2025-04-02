"use client"

import { useTheme } from "next-themes"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useState, useEffect } from "react"

const mockData = [
  {
    name: "Jan",
    total: 45,
  },
  {
    name: "Feb",
    total: 32,
  },
  {
    name: "Mar",
    total: 67,
  },
  {
    name: "Apr",
    total: 89,
  },
  {
    name: "May",
    total: 76,
  },
  {
    name: "Jun",
    total: 104,
  },
  {
    name: "Jul",
    total: 123,
  },
  {
    name: "Aug",
    total: 98,
  },
  {
    name: "Sep",
    total: 87,
  },
  {
    name: "Oct",
    total: 112,
  },
  {
    name: "Nov",
    total: 132,
  },
  {
    name: "Dec",
    total: 54,
  },
]

export function Overview() {
  const { theme } = useTheme()
  const [data, setData] = useState<typeof mockData>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData(mockData)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return <div className="h-[300px] w-full animate-pulse rounded-md bg-muted"></div>
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip
          cursor={{ fill: theme === "dark" ? "#1f2937" : "#f3f4f6", opacity: 0.5 }}
          contentStyle={{
            background: theme === "dark" ? "#1f2937" : "#ffffff",
            border: `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}`,
            borderRadius: "0.375rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}

