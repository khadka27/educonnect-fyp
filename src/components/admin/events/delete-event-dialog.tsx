"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface Event {
  id: string;
  title: string;
  _count?: {
    registrations: number;
    payments: number;
  };
}

interface DeleteEventDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteEventDialog({
  event,
  open,
  onOpenChange,
  onSuccess,
}: DeleteEventDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      // The actual delete operation is handled in the parent component
      onSuccess();
    } catch (error) {
      console.error("Error in delete dialog:", error);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if event has registrations or payments
  const hasRegistrations = event._count && event._count.registrations > 0;
  const hasPayments = event._count && event._count.payments > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the event{" "}
            <span className="font-medium">"{event.title}"</span> and all
            associated data.
            {(hasRegistrations || hasPayments) && (
              <div className="mt-2 rounded-md bg-amber-50 p-2 text-amber-800">
                <p className="font-medium">Warning:</p>
                <ul className="ml-4 list-disc">
                  {hasRegistrations && (
                    <li>
                      This event has {event._count?.registrations} registrations
                      that will be deleted.
                    </li>
                  )}
                  {hasPayments && (
                    <li>
                      This event has {event._count?.payments} payments that will
                      be deleted.
                    </li>
                  )}
                </ul>
              </div>
            )}
            <p className="mt-2">This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
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
  );
}
