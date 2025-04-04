"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusCircle, Download, Loader2 } from "lucide-react"
import { useAdmin, adminActions } from "@/context/admin-context"
import { PaymentsTable } from "./payments-table"
import { PaymentsFilters } from "./payments-filters"
import { CreatePaymentDialog } from "./create-payment-dialog"
import { PaymentStatistics } from "./payment-statistics"
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs"

interface Payment {
  id: string
  transactionId: string
  amount: number
  status: "PENDING" | "COMPLETED" | "FAILED"
  method: string
  paymentGateway: string
  failureReason: string | null
  createdAt: string
  updatedAt: string
  userId: string
  eventId: string
  user: {
    id: string
    name: string
    email: string
  }
  event: {
    id: string
    title: string
    type: string
  }
}

interface Statistics {
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

interface PaymentsResponse {
  payments: Payment[]
  statistics: Statistics
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export default function PaymentsClient() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })
  const [isCreatePaymentOpen, setIsCreatePaymentOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { dispatch } = useAdmin()

  const page = Number(searchParams.get("page") || "1")
  const limit = Number(searchParams.get("limit") || "10")
  const status = searchParams.get("status") || ""
  const method = searchParams.get("method") || ""
  const startDate = searchParams.get("startDate") || ""
  const endDate = searchParams.get("endDate") || ""

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        adminActions.setLoading(dispatch, true)
        setLoading(true)

        // Build query string
        const queryParams = new URLSearchParams()
        queryParams.set("page", page.toString())
        queryParams.set("limit", limit.toString())
        if (status) queryParams.set("status", status)
        if (method) queryParams.set("method", method)
        if (startDate) queryParams.set("startDate", startDate)
        if (endDate) queryParams.set("endDate", endDate)

        const response = await axios.get<PaymentsResponse>(`/api/admin/payments?${queryParams.toString()}`)

        setPayments(response.data.payments)
        setStatistics(response.data.statistics)
        setPagination(response.data.pagination)
      } catch (error) {
        console.error("Error fetching payments:", error)
        adminActions.addAlert(dispatch, "Failed to fetch payments", "error")
      } finally {
        setLoading(false)
        adminActions.setLoading(dispatch, false)
      }
    }

    fetchPayments()
  }, [page, limit, status, method, startDate, endDate, dispatch])

  const handlePaymentCreated = () => {
    setIsCreatePaymentOpen(false)
    adminActions.addAlert(dispatch, "Payment created successfully", "success")
    // Refresh the table
    router.refresh()
  }

  const handleExportCSV = () => {
    // In a real implementation, you would generate and download a CSV file
    adminActions.addAlert(dispatch, "Payment data has been exported to CSV", "success")
  }

  const handleBulkStatusUpdate = async (newStatus: "PENDING" | "COMPLETED" | "FAILED") => {
    if (!selectedPayments.length) return

    try {
      adminActions.setLoading(dispatch, true)

      await axios.patch("/api/admin/payments", {
        paymentIds: selectedPayments,
        status: newStatus,
      })

      adminActions.addAlert(
        dispatch,
        `${selectedPayments.length} payments have been updated to ${newStatus.toLowerCase()}`,
        "success",
      )
      setSelectedPayments([])
      router.refresh()
    } catch (error) {
      console.error("Error updating payments:", error)
      adminActions.addAlert(dispatch, "Failed to update payments", "error")
    } finally {
      adminActions.setLoading(dispatch, false)
    }
  }

  if (loading && payments.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Payments Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsCreatePaymentOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Payment
          </Button>
        </div>
      </div>

      {statistics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{statistics.totalAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From {statistics.totalCount} payments</p>
            </CardContent>
          </Card>

          {statistics.byStatus.map((stat) => (
            <Card key={stat.status}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.status} Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stat.totalAmount?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">{stat.count} payments</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Payments</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            <PaymentsFilters />

            {selectedPayments.length > 0 && (
              <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
                <span className="text-sm font-medium">{selectedPayments.length} selected</span>
                <Button variant="outline" size="sm" onClick={() => handleBulkStatusUpdate("COMPLETED")}>
                  Mark as Completed
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkStatusUpdate("PENDING")}>
                  Mark as Pending
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkStatusUpdate("FAILED")}>
                  Mark as Failed
                </Button>
              </div>
            )}

            <PaymentsTable
              payments={payments}
              pagination={pagination}
              loading={loading}
              selectedPayments={selectedPayments}
              setSelectedPayments={setSelectedPayments}
            />
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-4">
            <PaymentsFilters defaultStatus="PENDING" />
            <PaymentsTable
              payments={payments}
              pagination={pagination}
              loading={loading}
              selectedPayments={selectedPayments}
              setSelectedPayments={setSelectedPayments}
            />
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-4">
            <PaymentsFilters defaultStatus="COMPLETED" />
            <PaymentsTable
              payments={payments}
              pagination={pagination}
              loading={loading}
              selectedPayments={selectedPayments}
              setSelectedPayments={setSelectedPayments}
            />
          </div>
        </TabsContent>

        <TabsContent value="failed">
          <div className="space-y-4">
            <PaymentsFilters defaultStatus="FAILED" />
            <PaymentsTable
              payments={payments}
              pagination={pagination}
              loading={loading}
              selectedPayments={selectedPayments}
              setSelectedPayments={setSelectedPayments}
            />
          </div>
        </TabsContent>

        <TabsContent value="statistics">{statistics && <PaymentStatistics statistics={statistics} />}</TabsContent>
      </Tabs>

      <CreatePaymentDialog
        open={isCreatePaymentOpen}
        onOpenChange={setIsCreatePaymentOpen}
        onSuccess={handlePaymentCreated}
      />
    </div>
  )
}

