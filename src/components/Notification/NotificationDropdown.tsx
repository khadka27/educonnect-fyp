"use client";

import { useEffect, useState } from "react";

interface Notification {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data);
    };

    fetchNotifications();
  }, []);

  const markAsRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) markAsRead();
        }}
        className="relative"
      >
        Notifications
        {notifications.some((n) => !n.isRead) && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
            {notifications.filter((n) => !n.isRead).length}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-2 ${
                  notification.isRead ? "bg-gray-100" : "bg-white"
                }`}
              >
                {notification.content}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">No notifications</div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
