"use client"

import type React from "react"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog"
import { Button } from "src/components/ui/button"
import { Input } from "src/components/ui/input"
import { Label } from "src/components/ui/label"
import { Textarea } from "src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select"
import { useAdmin, adminActions } from "@/context/admin-context"
import { Loader2 } from "lucide-react"

interface Payment {
  id: string
  transactionId: string
  amount: number
  status: "PENDING" | "COMPLETED" | "FAILED"
  method: string
  paymentGateway: string
  failureReason: string | null
  userId: string
  eventId: string
  user: {
    name: string
    email: string
  }
  event: {
    title: string
  }
}

interface EditPaymentDialogProps {
  payment: Payment
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditPaymentDialog({ payment, open, onOpenChange, onSuccess }: EditPaymentDialogProps) {
  const [formData, setFormData] = useState({
    transactionId: "",
    amount: "",
    status: "",
    method: "",
    paymentGateway: "",
    failureReason: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { dispatch } = useAdmin()

  useEffect(() => {
    if (payment) {
      setFormData({
        transactionId: payment.transactionId,
        amount: payment.amount.toString(),
        status: payment.status,
        method: payment.method,
        paymentGateway: payment.paymentGateway,
        failureReason: payment.failureReason || "",
      })
    }
  }, [payment])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.transactionId.trim()) {
      newErrors.transactionId = "Transaction ID is required"
    }

    if (!formData.amount) {
      newErrors.amount = "Amount is required"
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be a positive number"
    }

    if (!formData.status) {
      newErrors.status = "Status is required"
    }

    if (!formData.method) {
      newErrors.method = "Payment method is required"
    }

    if (!formData.paymentGateway) {
      newErrors.paymentGateway = "Payment gateway is required"
    }

    // If status is FAILED, failure reason is required
    if (formData.status === "FAILED" && !formData.failureReason.trim()) {
      newErrors.failureReason = "Failure reason is required for failed payments"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    adminActions.setLoading(dispatch, true)

    try {
      const paymentData = {
        ...formData,
        amount: Number(formData.amount),
      }

      const response = await axios.put(`/api/admin/payments/${payment.id}`, paymentData)

      onSuccess()
    } catch (error: any) {
      console.error("Error updating payment:", error)

      if (error.response?.data?.error) {
        adminActions.addAlert(dispatch, error.response.data.error, "error")
      } else {
        adminActions.addAlert(dispatch, "Failed to update payment", "error")
      }
    } finally {
      setIsSubmitting(false)
      adminActions.setLoading(dispatch, false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Payment</DialogTitle>
          <DialogDescription>
            Update payment information for {payment.user.name}'s payment for {payment.event.title}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-transactionId">Transaction ID*</Label>
              <Input
                id="edit-transactionId"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                className={errors.transactionId ? "border-red-500" : ""}
              />
              {errors.transactionId && <p className="text-sm text-red-500">{errors.transactionId}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-amount">Amount (Rs)*</Label>
              <Input
                id="edit-amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status*</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-method">Payment Method*</Label>
                <Select value={formData.method} onValueChange={(value) => handleSelectChange("method", value)}>
                  <SelectTrigger id="edit-method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="NETBANKING">Net Banking</SelectItem>
                    <SelectItem value="WALLET">Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-paymentGateway">Payment Gateway*</Label>
              <Select
                value={formData.paymentGateway}
                onValueChange={(value) => handleSelectChange("paymentGateway", value)}
              >
                <SelectTrigger id="edit-paymentGateway">
                  <SelectValue placeholder="Select gateway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RAZORPAY">Razorpay</SelectItem>
                  <SelectItem value="STRIPE">Stripe</SelectItem>
                  <SelectItem value="PAYPAL">PayPal</SelectItem>
                  <SelectItem value="PAYTM">Paytm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.status === "FAILED" && (
              <div className="grid gap-2">
                <Label htmlFor="edit-failureReason">Failure Reason*</Label>
                <Textarea
                  id="edit-failureReason"
                  name="failureReason"
                  value={formData.failureReason}
                  onChange={handleChange}
                  placeholder="Enter reason for payment failure"
                  className={errors.failureReason ? "border-red-500" : ""}
                />
                {errors.failureReason && <p className="text-sm text-red-500">{errors.failureReason}</p>}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

