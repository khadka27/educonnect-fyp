"use client"

import type React from "react"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "src/components/ui/input"
import { Badge } from "src/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu"
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  Edit,
  Trash,
  Users,
  MessageSquare,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { useAdmin, adminActions } from "@/context/admin-context"
import { EditGroupDialog } from "./edit-group-dialog"
import { DeleteGroupDialog } from "./delete-group-dialog"

interface Group {
  id: string
  name: string
  createdAt: string
  admin: {
    id: string
    name: string
    email: string
    role: string
  }
  _count: {
    messages: number
    members: number
  }
}

interface GroupsResponse {
  groups: Group[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export function GroupsList() {
  const [groups, setGroups] = useState<Group[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null)
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const { dispatch } = useAdmin()

  const page = Number(searchParams.get("page") || "1")
  const search = searchParams.get("search") || ""

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true)

        // Build query string
        const queryParams = new URLSearchParams()
        queryParams.set("page", page.toString())
        if (search) queryParams.set("search", search)

        const response = await axios.get<GroupsResponse>(`/api/admin/chat/groups?${queryParams.toString()}`)

        setGroups(response.data.groups)
        setPagination(response.data.pagination)
      } catch (error) {
        console.error("Error fetching groups:", error)
        adminActions.addAlert(dispatch, "Failed to fetch groups", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [page, search, dispatch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery) {
      params.set("search", searchQuery)
    } else {
      params.delete("search")
    }
    params.set("page", "1")

    router.push(`/admin/chat?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())

    router.push(`/admin/chat?${params.toString()}`)
  }

  const handleGroupUpdated = () => {
    setGroupToEdit(null)
    adminActions.addAlert(dispatch, "Group updated successfully", "success")
    router.refresh()
  }

  const handleGroupDeleted = async () => {
    if (!groupToDelete) return

    try {
      adminActions.setLoading(dispatch, true)
      await axios.delete(`/api/admin/chat/groups/${groupToDelete.id}`)

      setGroupToDelete(null)
      adminActions.addAlert(dispatch, "Group deleted successfully", "success")
      router.refresh()
    } catch (error) {
      console.error("Error deleting group:", error)
      adminActions.addAlert(dispatch, "Failed to delete group", "error")
    } finally {
      adminActions.setLoading(dispatch, false)
    }
  }

  const handleViewGroup = (groupId: string) => {
    router.push(`/admin/chat/groups/${groupId}`)
  }

  const handleViewMembers = (groupId: string) => {
    router.push(`/admin/chat/groups/${groupId}/members`)
  }

  if (loading && groups.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search groups..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group Name</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No groups found.
                </TableCell>
              </TableRow>
            ) : (
              groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{group.admin.name}</span>
                      <span className="text-xs text-muted-foreground">{group.admin.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{group._count.members}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{group._count.messages}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(group.createdAt), "MMM d, yyyy")}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleViewGroup(group.id)}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          View Messages
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewMembers(group.id)}>
                          <Users className="mr-2 h-4 w-4" />
                          Manage Members
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setGroupToEdit(group)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setGroupToDelete(group)}>
                          <Trash className="mr-2 h-4 w-4" />
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
          {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems}
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
            disabled={pagination.currentPage >= pagination.totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>

      {groupToEdit && (
        <EditGroupDialog
          group={groupToEdit}
          open={!!groupToEdit}
          onOpenChange={() => setGroupToEdit(null)}
          onSuccess={handleGroupUpdated}
        />
      )}

      {groupToDelete && (
        <DeleteGroupDialog
          group={groupToDelete}
          open={!!groupToDelete}
          onOpenChange={() => setGroupToDelete(null)}
          onSuccess={handleGroupDeleted}
        />
      )}
    </div>
  )
}

