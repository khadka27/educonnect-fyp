"use client";

import type React from "react";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import { Button } from "src/components/ui/button";
import { Badge } from "src/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { EditPaymentDialog } from "./edit-payment-dialog";
import { DeletePaymentDialog } from "./delete-payment-dialog";
import { useAdmin, adminActions } from "@/context/admin-context";
import axios from "axios";

interface Payment {
  id: string;
  transactionId: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  method: string;
  paymentGateway: string;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  eventId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  event: {
    id: string;
    title: string;
    type: string;
  };
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface PaymentsTableProps {
  payments: Payment[];
  pagination: PaginationData;
  loading: boolean;
  selectedPayments: string[];
  setSelectedPayments: React.Dispatch<React.SetStateAction<string[]>>;
}

export function PaymentsTable({
  payments,
  pagination,
  loading,
  selectedPayments,
  setSelectedPayments,
}: PaymentsTableProps) {
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { dispatch } = useAdmin();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayments(payments.map((payment) => payment.id));
    } else {
      setSelectedPayments([]);
    }
  };

  const handleSelectPayment = (paymentId: string, checked: boolean) => {
    if (checked) {
      setSelectedPayments((prev) => [...prev, paymentId]);
    } else {
      setSelectedPayments((prev) => prev.filter((id) => id !== paymentId));
    }
  };

  const handlePaymentUpdated = () => {
    setPaymentToEdit(null);
    adminActions.addAlert(dispatch, "Payment updated successfully", "success");
    router.refresh();
  };

  const handlePaymentDeleted = async () => {
    if (!paymentToDelete) return;

    try {
      adminActions.setLoading(dispatch, true);
      await axios.delete(`/api/admin/payments/${paymentToDelete.id}`);

      setPaymentToDelete(null);
      adminActions.addAlert(
        dispatch,
        "Payment deleted successfully",
        "success"
      );
      router.refresh();
    } catch (error) {
      console.error("Error deleting payment:", error);
      adminActions.addAlert(dispatch, "Failed to delete payment", "error");
    } finally {
      adminActions.setLoading(dispatch, false);
    }
  };

  const handleViewPayment = (paymentId: string) => {
    router.push(`/admin/payments/${paymentId}`);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "PENDING":
        return "warning";
      case "FAILED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedPayments.length === payments.length &&
                    payments.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all payments"
                />
              </TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pagination.itemsPerPage }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 w-4 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-20 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-8 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPayments.includes(payment.id)}
                      onCheckedChange={(checked) =>
                        handleSelectPayment(payment.id, !!checked)
                      }
                      aria-label={`Select payment ${payment.transactionId}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {payment.transactionId}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{payment.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {payment.user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{payment.event.title}</TableCell>
                  <TableCell>Rs{payment.amount.toLocaleString()}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(payment.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleViewPayment(payment.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setPaymentToEdit(payment)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setPaymentToDelete(payment)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
          {Math.min(
            pagination.currentPage * pagination.itemsPerPage,
            pagination.totalItems
          )}{" "}
          of {pagination.totalItems}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={
              pagination.currentPage >= pagination.totalPages || loading
            }
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>

      {paymentToEdit && (
        <EditPaymentDialog
          payment={paymentToEdit}
          open={!!paymentToEdit}
          onOpenChange={() => setPaymentToEdit(null)}
          onSuccess={handlePaymentUpdated}
        />
      )}

      {paymentToDelete && (
        <DeletePaymentDialog
          payment={paymentToDelete}
          open={!!paymentToDelete}
          onOpenChange={() => setPaymentToDelete(null)}
          onSuccess={handlePaymentDeleted}
        />
      )}
    </div>
  );
}
