"use client";

import type React from "react";

import { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import { useAdmin, adminActions } from "@/context/admin-context";
import { Loader2 } from "lucide-react";

interface CreatePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreatePaymentDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreatePaymentDialogProps) {
  const [formData, setFormData] = useState({
    transactionId: "",
    userId: "",
    eventId: "",
    amount: "",
    status: "COMPLETED",
    method: "CREDIT_CARD",
    paymentGateway: "RAZORPAY",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>(
    []
  );
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const { dispatch } = useAdmin();

  // In a real implementation, you would fetch users and events from the API
  // For now, we'll use mock data
  const mockUsers = [
    { id: "user1", name: "John Doe", email: "john@example.com" },
    { id: "user2", name: "Jane Smith", email: "jane@example.com" },
    { id: "user3", name: "Robert Johnson", email: "robert@example.com" },
  ];

  const mockEvents = [
    { id: "event1", title: "Web Development Workshop" },
    { id: "event2", title: "Data Science Bootcamp" },
    { id: "event3", title: "UI/UX Design Masterclass" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.transactionId.trim()) {
      newErrors.transactionId = "Transaction ID is required";
    }

    if (!formData.userId) {
      newErrors.userId = "User is required";
    }

    if (!formData.eventId) {
      newErrors.eventId = "Event is required";
    }

    if (!formData.amount) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    if (!formData.method) {
      newErrors.method = "Payment method is required";
    }

    if (!formData.paymentGateway) {
      newErrors.paymentGateway = "Payment gateway is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    adminActions.setLoading(dispatch, true);

    try {
      const paymentData = {
        ...formData,
        amount: Number(formData.amount),
      };

      const response = await axios.post("/api/admin/payments", paymentData);

      // Reset form
      setFormData({
        transactionId: "",
        userId: "",
        eventId: "",
        amount: "",
        status: "COMPLETED",
        method: "CREDIT_CARD",
        paymentGateway: "RAZORPAY",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error creating payment:", error);

      if (error.response?.data?.error) {
        adminActions.addAlert(dispatch, error.response.data.error, "error");
      } else {
        adminActions.addAlert(dispatch, "Failed to create payment", "error");
      }
    } finally {
      setIsSubmitting(false);
      adminActions.setLoading(dispatch, false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Payment</DialogTitle>
          <DialogDescription>
            Manually add a payment record to the system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="transactionId">Transaction ID*</Label>
              <Input
                id="transactionId"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                placeholder="Enter transaction ID"
                className={errors.transactionId ? "border-red-500" : ""}
              />
              {errors.transactionId && (
                <p className="text-sm text-red-500">{errors.transactionId}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="userId">User*</Label>
              <Select
                value={formData.userId}
                onValueChange={(value) => handleSelectChange("userId", value)}
              >
                <SelectTrigger
                  id="userId"
                  className={errors.userId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {loadingUsers ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    mockUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.userId && (
                <p className="text-sm text-red-500">{errors.userId}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="eventId">Event*</Label>
              <Select
                value={formData.eventId}
                onValueChange={(value) => handleSelectChange("eventId", value)}
              >
                <SelectTrigger
                  id="eventId"
                  className={errors.eventId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {loadingEvents ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    mockEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.eventId && (
                <p className="text-sm text-red-500">{errors.eventId}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (Rs)*</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status*</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger id="status">
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
                <Label htmlFor="method">Payment Method*</Label>
                <Select
                  value={formData.method}
                  onValueChange={(value) => handleSelectChange("method", value)}
                >
                  <SelectTrigger id="method">
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
              <Label htmlFor="paymentGateway">Payment Gateway*</Label>
              <Select
                value={formData.paymentGateway}
                onValueChange={(value) =>
                  handleSelectChange("paymentGateway", value)
                }
              >
                <SelectTrigger id="paymentGateway">
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
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
