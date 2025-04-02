/* eslint-disable @typescript-eslint/no-explicit-any */
// context/AdminContext.tsx
"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";

// Define the state structure
interface AdminState {
  sidebarOpen: boolean;
  activeView: string;
  notifications: Notification[];
  alerts: Alert[];
  dashboardStats: any;
  isLoading: boolean;
  error: string | null;
}

// Define notification and alert interfaces
interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
}

interface Alert {
  id: string;
  message: string;
  type: "success" | "warning" | "error";
  autoClose: boolean;
}

// Define action types
type AdminAction =
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_ACTIVE_VIEW"; payload: string }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "MARK_NOTIFICATION_READ"; payload: string }
  | { type: "CLEAR_NOTIFICATIONS" }
  | { type: "ADD_ALERT"; payload: Alert }
  | { type: "REMOVE_ALERT"; payload: string }
  | { type: "SET_DASHBOARD_STATS"; payload: any }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

// Create the initial state
const initialState: AdminState = {
  sidebarOpen: true,
  activeView: "dashboard",
  notifications: [],
  alerts: [],
  dashboardStats: null,
  isLoading: false,
  error: null,
};

// Create the context
const AdminContext = createContext<{
  state: AdminState;
  dispatch: React.Dispatch<AdminAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Create the reducer function
function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };
    case "SET_ACTIVE_VIEW":
      return {
        ...state,
        activeView: action.payload,
      };
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
      };
    case "CLEAR_NOTIFICATIONS":
      return {
        ...state,
        notifications: [],
      };
    case "ADD_ALERT":
      return {
        ...state,
        alerts: [action.payload, ...state.alerts],
      };
    case "REMOVE_ALERT":
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.payload),
      };
    case "SET_DASHBOARD_STATS":
      return {
        ...state,
        dashboardStats: action.payload,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
}

// Create the provider component
interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  return (
    <AdminContext.Provider value={{ state, dispatch }}>
      {children}
    </AdminContext.Provider>
  );
};

// Custom hook to use the admin context
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

// Utility functions for common actions
export const adminActions = {
  toggleSidebar: (dispatch: React.Dispatch<AdminAction>) => {
    dispatch({ type: "TOGGLE_SIDEBAR" });
  },

  setActiveView: (dispatch: React.Dispatch<AdminAction>, view: string) => {
    dispatch({ type: "SET_ACTIVE_VIEW", payload: view });
  },

  addNotification: (
    dispatch: React.Dispatch<AdminAction>,
    message: string,
    type: "info" | "success" | "warning" | "error" = "info"
  ) => {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
      read: false,
    };
    dispatch({ type: "ADD_NOTIFICATION", payload: notification });
  },

  markNotificationRead: (dispatch: React.Dispatch<AdminAction>, id: string) => {
    dispatch({ type: "MARK_NOTIFICATION_READ", payload: id });
  },

  clearNotifications: (dispatch: React.Dispatch<AdminAction>) => {
    dispatch({ type: "CLEAR_NOTIFICATIONS" });
  },

  addAlert: (
    dispatch: React.Dispatch<AdminAction>,
    message: string,
    type: "success" | "warning" | "error" = "success",
    autoClose: boolean = true
  ) => {
    const alert: Alert = {
      id: Date.now().toString(),
      message,
      type,
      autoClose,
    };
    dispatch({ type: "ADD_ALERT", payload: alert });

    // Auto-close the alert after 5 seconds if autoClose is true
    if (autoClose) {
      setTimeout(() => {
        dispatch({ type: "REMOVE_ALERT", payload: alert.id });
      }, 5000);
    }
  },

  removeAlert: (dispatch: React.Dispatch<AdminAction>, id: string) => {
    dispatch({ type: "REMOVE_ALERT", payload: id });
  },

  setDashboardStats: (dispatch: React.Dispatch<AdminAction>, stats: any) => {
    dispatch({ type: "SET_DASHBOARD_STATS", payload: stats });
  },

  setLoading: (dispatch: React.Dispatch<AdminAction>, isLoading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: isLoading });
  },

  setError: (dispatch: React.Dispatch<AdminAction>, error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  },
};

export default AdminContext;
