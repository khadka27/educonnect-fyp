"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"

interface Payment {
  id: string
  transactionId: string
  amount: number
  status: string
  user: {
    name: string
  }
  event: {
    title: string
  }
}

interface DeletePaymentDialogProps {
  payment: Payment
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeletePaymentDialog({ payment, open, onOpenChange, onSuccess }: DeletePaymentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      // The actual delete operation is handled in the parent component
      onSuccess()
    } catch (error) {
      console.error("Error in delete dialog:", error)
      onOpenChange(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the payment record for transaction{" "}
            <span className="font-medium">{payment.transactionId}</span>({payment.user.name}'s payment of Rs
            {payment.amount} for {payment.event.title}).
            <p className="mt-2">This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

