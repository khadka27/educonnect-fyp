"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card"
import { Badge } from "src/components/ui/badge"
import { ArrowLeft, Edit, Trash, Loader2, CreditCard, User, Calendar } from "lucide-react"
import { format } from "date-fns"
import { useAdmin, adminActions } from "@/context/admin-context"
import { EditPaymentDialog } from "src/components/admin/payments/edit-payment-dialog"
import { DeletePaymentDialog } from "src/components/admin/payments/delete-payment-dialog"
import { Separator } from "src/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar"

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
    username: string
    profileImage: string | null
  }
  event: {
    id: string
    title: string
    description: string | null
    type: string
    date: string
    location: string
    price: number | null
  }
}

export default function PaymentDetailPage({ params }: { params: { id: string } }) {
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const router = useRouter()
  const { dispatch } = useAdmin()

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setLoading(true)
        const response = await axios.get<Payment>(`/api/admin/payments/${params.id}`)
        setPayment(response.data)
      } catch (error) {
        console.error("Error fetching payment:", error)
        adminActions.addAlert(dispatch, "Failed to fetch payment details", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchPayment()
  }, [params.id, dispatch])

  const handlePaymentUpdated = () => {
    setIsEditDialogOpen(false)
    adminActions.addAlert(dispatch, "Payment updated successfully", "success")
    // Refresh the payment data
    router.refresh()
  }

  const handlePaymentDeleted = async () => {
    try {
      await axios.delete(`/api/admin/payments/${params.id}`)

      adminActions.addAlert(dispatch, "Payment deleted successfully", "success")
      router.push("/admin/payments")
    } catch (error) {
      console.error("Error deleting payment:", error)
      adminActions.addAlert(dispatch, "Failed to delete payment", "error")
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success"
      case "PENDING":
        return "warning"
      case "FAILED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatMethodName = (method: string) => {
    return method
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Payment not found</h1>
        <Button onClick={() => router.push("/admin/payments")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/admin/payments")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">Transaction ID:</span>
              <span className="font-medium">{payment.transactionId}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">Amount:</span>
              <span className="font-medium">₹{payment.amount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">Status:</span>
              <Badge variant={getStatusBadgeVariant(payment.status)}>{payment.status}</Badge>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">Payment Method:</span>
              <span>{formatMethodName(payment.method)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">Payment Gateway:</span>
              <span>{payment.paymentGateway}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">Created At:</span>
              <span>{format(new Date(payment.createdAt), "PPP p")}</span>
            </div>

            {payment.updatedAt !== payment.createdAt && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Last Updated:</span>
                <span>{format(new Date(payment.updatedAt), "PPP p")}</span>
              </div>
            )}

            {payment.status === "FAILED" && payment.failureReason && (
              <>
                <Separator />
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Failure Reason:</span>
                  <p className="mt-1 text-sm text-destructive">{payment.failureReason}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={payment.user.profileImage || undefined} alt={payment.user.name} />
                  <AvatarFallback>{getInitials(payment.user.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{payment.user.name}</p>
                  <p className="text-sm text-muted-foreground">@{payment.user.username}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Email:</span>
                <span>{payment.user.email}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => router.push(`/admin/users/${payment.userId}`)}
              >
                View User Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{payment.event.title}</p>
                {payment.event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{payment.event.description}</p>
                )}
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Date:</span>
                <span>{format(new Date(payment.event.date), "PPP")}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Location:</span>
                <span>{payment.event.location}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Type:</span>
                <Badge variant={payment.event.type === "PREMIUM" ? "default" : "secondary"}>{payment.event.type}</Badge>
              </div>

              {payment.event.price && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Price:</span>
                  <span>₹{payment.event.price.toLocaleString()}</span>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => router.push(`/admin/events/${payment.eventId}`)}
              >
                View Event Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {payment && (
        <>
          <EditPaymentDialog
            payment={payment}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSuccess={handlePaymentUpdated}
          />

          <DeletePaymentDialog
            payment={payment}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onSuccess={handlePaymentDeleted}
          />
        </>
      )}
    </div>
  )
}

