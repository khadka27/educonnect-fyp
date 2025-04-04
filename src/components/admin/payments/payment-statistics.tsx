"use client"

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

interface PaymentStatisticsProps {
  statistics: {
    byStatus: Array<{
      status: string
      count: number
      totalAmount: number
    }>
    byMethod: Array<{
      method: string
      count: number
      totalAmount: number
    }>
    totalAmount: number
    totalCount: number
  }
}

export function PaymentStatistics({ statistics }: PaymentStatisticsProps) {
  // Format data for the charts
  const statusData = statistics.byStatus.map((item) => ({
    name: item.status,
    value: item.count,
    amount: item.totalAmount,
  }))

  const methodData = statistics.byMethod.map((item) => ({
    name: item.method,
    value: item.count,
    amount: item.totalAmount,
  }))

  // Colors for the pie charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  // Format method name for display
  const formatMethodName = (method: string) => {
    return method
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  // Format status name for display
  const formatStatusName = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase()
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Payment Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Status Distribution</CardTitle>
            <CardDescription>Distribution of payments by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value, percent }) =>
                      `${formatStatusName(name)}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} payments`, formatStatusName(name as string)]} />
                  <Legend formatter={(value) => formatStatusName(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Distribution</CardTitle>
            <CardDescription>Distribution of payments by method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={methodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value, percent }) =>
                      `${formatMethodName(name)}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {methodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} payments`, formatMethodName(name as string)]} />
                  <Legend formatter={(value) => formatMethodName(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Status */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Status</CardTitle>
          <CardDescription>Total revenue by payment status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tickFormatter={(value) => formatStatusName(value)} />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    `₹${Number(value).toLocaleString()}`,
                    name === "amount" ? "Revenue" : "Count",
                  ]}
                  labelFormatter={(label) => `Status: ${formatStatusName(label)}`}
                />
                <Legend />
                <Bar dataKey="amount" name="Revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Method */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Payment Method</CardTitle>
          <CardDescription>Total revenue by payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={methodData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tickFormatter={(value) => formatMethodName(value)} />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    `₹${Number(value).toLocaleString()}`,
                    name === "amount" ? "Revenue" : "Count",
                  ]}
                  labelFormatter={(label) => `Method: ${formatMethodName(label)}`}
                />
                <Legend />
                <Bar dataKey="amount" name="Revenue" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

