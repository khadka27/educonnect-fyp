import { useEffect, useState } from "react";
import io from "socket.io-client";

const Navbar = () => {
  const [notifications, setNotifications] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const socket = io();

    // Join the user's room (replace with actual user ID from session)
    const userId = "user-id-placeholder"; // Replace with actual user ID
    socket.emit("joinRoom", userId);

    // Listen for new notifications
    socket.on("newNotification", (notification: any) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const markAllAsRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">EduConnect</div>
      <div className="navbar-notifications">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="notification-button"
        >
          Notifications
          {notifications.some((n) => !n.isRead) && (
            <span className="notification-badge">
              {notifications.filter((n) => !n.isRead).length}
            </span>
          )}
        </button>
        {isDropdownOpen && (
          <div className="notification-dropdown">
            <button onClick={markAllAsRead} className="mark-read-button">
              Mark all as read
            </button>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    notification.isRead ? "read" : "unread"
                  }`}
                >
                  {notification.content}
                </div>
              ))
            ) : (
              <div className="no-notifications">No notifications</div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
