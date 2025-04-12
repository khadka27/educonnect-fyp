"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle,
  CreditCard,
  Edit,
  Trash,
  UserCheck,
  UserX,
  MessageSquare,
} from "lucide-react"
import { format } from "date-fns"
import { EditUserDialog } from "./edit-user-dialog"
import { DeleteUserDialog } from "./delete-user-dialog"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  username: string
  role: string
  isVerified: boolean
  createdAt: string
  profileImage?: string
  bio?: string
  location?: string
  phone?: string
  lastActive?: string
  enrolledCourses?: number
  completedCourses?: number
  totalPayments?: number
}

interface UserDetailClientProps {
  userId: string
}

export function UserDetailClient({ userId }: UserDetailClientProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Simulate API call to fetch user data
    const fetchUser = async () => {
      setLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock user data
        setUser({
          id: userId,
          name: "John Doe",
          email: "john@example.com",
          username: "johndoe",
          role: "STUDENT",
          isVerified: true,
          createdAt: "2023-01-15T00:00:00.000Z",
          profileImage: "/placeholder.svg?height=128&width=128",
          bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.",
          location: "New York, USA",
          phone: "+1 (555) 123-4567",
          lastActive: "2023-06-15T00:00:00.000Z",
          enrolledCourses: 5,
          completedCourses: 3,
          totalPayments: 250.0,
        })
      } catch (error) {
        console.error("Error fetching user:", error)
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId, toast])

  const handleUserUpdated = () => {
    setIsEditOpen(false)
    toast({
      title: "User updated",
      description: "User information has been updated successfully",
      variant: "success",
    })
    router.refresh()
  }

  const handleUserDeleted = () => {
    setIsDeleteOpen(false)
    toast({
      title: "User deleted",
      description: "User has been deleted successfully",
      variant: "success",
    })
    router.push("/admin/users")
  }

  const handleVerifyUser = () => {
    // In a real app, this would be an API call
    toast({
      title: "User verified",
      description: "User has been verified successfully",
      variant: "success",
    })

    // Update local state
    if (user) {
      setUser({
        ...user,
        isVerified: true,
      })
    }
  }

  const handleSuspendUser = () => {
    // In a real app, this would be an API call
    toast({
      title: "User suspended",
      description: "User has been suspended successfully",
      variant: "success",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive"
      case "TEACHER":
        return "default"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-[400px] animate-pulse rounded-md bg-muted"></div>
          <div className="h-[400px] animate-pulse rounded-md bg-muted"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold text-foreground">User not found</h2>
        <p className="text-muted-foreground">The user you are looking for does not exist or has been deleted.</p>
        <Button className="mt-4" onClick={() => router.push("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Profile Information</CardTitle>
            <CardDescription>User details and personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-xl">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-foreground">{user.name}</h3>
                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                  <Badge variant={user.isVerified ? "outline" : "secondary"}>
                    {user.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{user.phone}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">Joined {format(new Date(user.createdAt), "MMMM d, yyyy")}</span>
              </div>
              {user.lastActive && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    Last active {format(new Date(user.lastActive), "MMMM d, yyyy")}
                  </span>
                </div>
              )}
            </div>

            {user.bio && (
              <>
                <Separator />
                <div>
                  <h4 className="mb-2 font-medium text-foreground">Bio</h4>
                  <p className="text-sm text-foreground">{user.bio}</p>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => (window.location.href = `mailto:${user.email}`)}>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
            <Button variant="outline" onClick={() => router.push(`/admin/chat?user=${user.id}`)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Account Statistics</CardTitle>
              <CardDescription>User activity and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold text-foreground">{user.enrolledCourses || 0}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Completed Courses</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold text-foreground">{user.completedCourses || 0}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Payments</p>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold text-foreground">
                      ${user.totalPayments?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 text-muted-foreground">%</div>
                    <span className="text-2xl font-bold text-foreground">
                      {user.enrolledCourses && user.completedCourses
                        ? Math.round((user.completedCourses / user.enrolledCourses) * 100)
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Account Actions</CardTitle>
              <CardDescription>Manage user account status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={handleVerifyUser} disabled={user.isVerified}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  {user.isVerified ? "Already Verified" : "Verify User"}
                </Button>
                <Button variant="outline" onClick={handleSuspendUser}>
                  <UserX className="mr-2 h-4 w-4" />
                  Suspend User
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Activity</CardTitle>
              <CardDescription>Recent user activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="courses">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="courses" className="text-foreground">
                    Courses
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="text-foreground">
                    Payments
                  </TabsTrigger>
                  <TabsTrigger value="logins" className="text-foreground">
                    Logins
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="courses" className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">Recent course activity will appear here.</p>
                </TabsContent>
                <TabsContent value="payments" className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">Recent payment activity will appear here.</p>
                </TabsContent>
                <TabsContent value="logins" className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">Recent login activity will appear here.</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {isEditOpen && (
        <EditUserDialog user={user} open={isEditOpen} onOpenChange={setIsEditOpen} onSuccess={handleUserUpdated} />
      )}

      {isDeleteOpen && (
        <DeleteUserDialog
          user={user}
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onSuccess={handleUserDeleted}
        />
      )}
    </div>
  )
}
