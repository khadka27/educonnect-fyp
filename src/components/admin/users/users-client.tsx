/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusCircle, Download, Trash, Mail } from "lucide-react"
import { useAdmin, adminActions } from "@/context/admin-context"
import { UsersTable } from "src/components/admin/users/users-table"
import { UsersTableFilters } from "src/components/admin/users/users-table-filters"
import { CreateUserDialog } from "./create-user-dialog"

interface User {
  id: string
  name: string
  email: string
  username: string
  role: string
  isVerified: boolean
  createdAt: string
  profileImage?: string
}

interface UsersResponse {
  users: User[]
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { dispatch } = useAdmin()

  const page = Number(searchParams.get("page") || "1")
  const limit = Number(searchParams.get("limit") || "10")
  const search = searchParams.get("search") || ""
  const role = searchParams.get("role") || ""

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        adminActions.setLoading(dispatch, true)
        setLoading(true)

        // Build query string
        const queryParams = new URLSearchParams()
        queryParams.set("page", page.toString())
        queryParams.set("limit", limit.toString())
        if (search) queryParams.set("search", search)
        if (role && role !== "ALL") queryParams.set("role", role)

        const response = await axios.get<UsersResponse>(`/api/admin/users?${queryParams.toString()}`)

        setUsers(response.data.users)
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalItems: response.data.totalItems,
          itemsPerPage: response.data.itemsPerPage,
        })
      } catch (error) {
        console.error("Error fetching users:", error)
        adminActions.addAlert(dispatch, "Failed to fetch users", "error")
      } finally {
        setLoading(false)
        adminActions.setLoading(dispatch, false)
      }
    }

    fetchUsers()
  }, [page, limit, search, role, dispatch])

  const handleUserCreated = () => {
    setIsCreateUserOpen(false)
    adminActions.addAlert(dispatch, "User created successfully", "success")
    // Refresh the table
    router.refresh()
  }

  const handleBulkDelete = async () => {
    if (!selectedUsers.length) return

    try {
      adminActions.setLoading(dispatch, true)

      // In a real app, you would implement bulk delete API
      // await Promise.all(selectedUsers.map(id => axios.delete(`/api/admin/users/${id}`)));

      adminActions.addAlert(dispatch, `${selectedUsers.length} users have been deleted`, "success")
      setSelectedUsers([])
      router.refresh()
    } catch (error) {
      console.error("Error deleting users:", error)
      adminActions.addAlert(dispatch, "Failed to delete users", "error")
    } finally {
      adminActions.setLoading(dispatch, false)
    }
  }

  const handleExportCSV = () => {
    // In a real app, this would generate and download a CSV file
    adminActions.addAlert(dispatch, "User data has been exported to CSV", "success")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <Button onClick={() => setIsCreateUserOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <UsersTableFilters />

      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
          <span className="text-sm font-medium">{selectedUsers.length} selected</span>
          <Button variant="outline" size="sm" onClick={handleBulkDelete}>
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>
      )}

      <UsersTable
        users={users}
        pagination={pagination}
        loading={loading}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
      />

      <CreateUserDialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen} onSuccess={handleUserCreated} />
    </div>
  )
}

