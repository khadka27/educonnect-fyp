import { Bell, CheckCircle, BellOff } from "lucide-react"
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "src/components/ui/tooltip"

interface Notification {
  id: Key | null | undefined;
  content: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined;
  time: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined;
}

interface NotificationBellProps {
  notifications: Notification[];
  unreadNotifications: number;
}

const NotificationBell = ({ notifications, unreadNotifications }: NotificationBellProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-gray-400 hover:text-gray-500">
          <Bell className="h-6 w-6" />
          {unreadNotifications > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadNotifications}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex justify-between items-center p-2">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <CheckCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark all as read</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <BellOff className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mute notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="overflow-y-auto max-h-64">
          {notifications.map((notification: { id: Key | null | undefined; content: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; time: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined }) => (
            <DropdownMenuItem key={notification.id} className="flex flex-col items-start py-2">
              <span>{notification.content}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationBell

