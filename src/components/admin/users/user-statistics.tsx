"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "src/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "src/components/ui/chart";

// Sample data - replace with actual API data in production
const monthlyRegistrations = [
  { name: "Jan", users: 65 },
  { name: "Feb", users: 59 },
  { name: "Mar", users: 80 },
  { name: "Apr", users: 81 },
  { name: "May", users: 56 },
  { name: "Jun", users: 55 },
  { name: "Jul", users: 40 },
  { name: "Aug", users: 70 },
  { name: "Sep", users: 90 },
  { name: "Oct", users: 110 },
  { name: "Nov", users: 130 },
  { name: "Dec", users: 150 },
];

const userRoles = [
  { name: "Students", value: 720 },
  { name: "Teachers", value: 45 },
  { name: "Admins", value: 15 },
];

const userActivity = [
  { name: "Mon", active: 120, new: 10 },
  { name: "Tue", active: 132, new: 8 },
  { name: "Wed", active: 101, new: 15 },
  { name: "Thu", active: 134, new: 12 },
  { name: "Fri", active: 90, new: 5 },
  { name: "Sat", active: 85, new: 8 },
  { name: "Sun", active: 93, new: 11 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function UserStatistics() {
  const [period, setPeriod] = useState("yearly");

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">
          User Statistics
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Overview of user registrations, roles, and activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="registrations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="roles">User Roles</TabsTrigger>
            <TabsTrigger value="activity">User Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="space-y-4">
            <div className="flex justify-end">
              <TabsList className="bg-muted">
                <TabsTrigger
                  value="monthly"
                  className={
                    period === "monthly" ? "bg-background text-foreground" : ""
                  }
                  onClick={() => setPeriod("monthly")}
                >
                  Monthly
                </TabsTrigger>
                <TabsTrigger
                  value="yearly"
                  className={
                    period === "yearly" ? "bg-background text-foreground" : ""
                  }
                  onClick={() => setPeriod("yearly")}
                >
                  Yearly
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  users: {
                    label: "New Users",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyRegistrations}
                    margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey="users"
                      fill="var(--color-users)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userRoles}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {userRoles.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} users`, "Count"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  active: {
                    label: "Active Users",
                    color: "hsl(var(--chart-1))",
                  },
                  new: {
                    label: "New Users",
                    color: "hsl(var(--chart-2))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={userActivity}
                    margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="active"
                      stroke="var(--color-active)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="new"
                      stroke="var(--color-new)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
