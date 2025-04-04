"use client";

import type React from "react";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog";
import { Button } from "src/components/ui/button";
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

interface Group {
  id: string;
  name: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
}

interface EditGroupDialogProps {
  group: Group;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditGroupDialog({
  group,
  open,
  onOpenChange,
  onSuccess,
}: EditGroupDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    adminId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [admins, setAdmins] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  const { dispatch } = useAdmin();

  // In a real implementation, you would fetch admins from the API
  // For now, we'll use a mock list
  const mockAdmins = [
    { id: "admin1", name: "Admin User", email: "admin@example.com" },
    { id: "teacher1", name: "Teacher One", email: "teacher1@example.com" },
    { id: "teacher2", name: "Teacher Two", email: "teacher2@example.com" },
  ];

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        adminId: group.admin.id,
      });
    }
  }, [group]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAdminChange = (value: string) => {
    setFormData((prev) => ({ ...prev, adminId: value }));
    if (errors.adminId) {
      setErrors((prev) => ({ ...prev, adminId: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Group name is required";
    }

    if (!formData.adminId) {
      newErrors.adminId = "Group admin is required";
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
      const response = await axios.put(
        `/api/admin/chat/groups/${group.id}`,
        formData
      );

      onSuccess();
    } catch (error: any) {
      console.error("Error updating group:", error);

      if (error.response?.data?.error) {
        adminActions.addAlert(dispatch, error.response.data.error, "error");
      } else {
        adminActions.addAlert(dispatch, "Failed to update group", "error");
      }
    } finally {
      setIsSubmitting(false);
      adminActions.setLoading(dispatch, false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>Update group information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Group Name*</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-adminId">Group Admin*</Label>
              <Select
                value={formData.adminId}
                onValueChange={handleAdminChange}
              >
                <SelectTrigger
                  id="edit-adminId"
                  className={errors.adminId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select admin" />
                </SelectTrigger>
                <SelectContent>
                  {loadingAdmins ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    mockAdmins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.name} ({admin.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.adminId && (
                <p className="text-sm text-red-500">{errors.adminId}</p>
              )}
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
