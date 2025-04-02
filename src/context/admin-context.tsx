"use client"

import type React from "react"

import { createContext, useContext, useReducer, type ReactNode } from "react"

// Types
export interface Alert {
  id: string
  message: string
  type: "success" | "error" | "warning"
}

export interface Notification {
  id: string
  message: string
  read: boolean
  createdAt: string
}

interface AdminState {
  isLoading: boolean
  error: string | null
  sidebarOpen: boolean
  activeView: string
  alerts: Alert[]
  notifications: Notification[]
}

type AdminAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_ACTIVE_VIEW"; payload: string }
  | { type: "ADD_ALERT"; payload: Alert }
  | { type: "REMOVE_ALERT"; payload: string }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "MARK_NOTIFICATION_READ"; payload: string }

const initialState: AdminState = {
  isLoading: false,
  error: null,
  sidebarOpen: true,
  activeView: "dashboard",
  alerts: [],
  notifications: [],
}

const adminReducer = (state: AdminState, action: AdminAction): AdminState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen }
    case "SET_ACTIVE_VIEW":
      return { ...state, activeView: action.payload }
    case "ADD_ALERT":
      return { ...state, alerts: [...state.alerts, action.payload] }
    case "REMOVE_ALERT":
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.payload),
      }
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      }
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload ? { ...notification, read: true } : notification,
        ),
      }
    default:
      return state
  }
}

// Create context
const AdminContext = createContext<{
  state: AdminState
  dispatch: React.Dispatch<AdminAction>
}>({
  state: initialState,
  dispatch: () => null,
})

// Action creators
export const adminActions = {
  setLoading: (dispatch: React.Dispatch<AdminAction>, isLoading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: isLoading })
  },
  setError: (dispatch: React.Dispatch<AdminAction>, error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error })
  },
  toggleSidebar: (dispatch: React.Dispatch<AdminAction>) => {
    dispatch({ type: "TOGGLE_SIDEBAR" })
  },
  setActiveView: (dispatch: React.Dispatch<AdminAction>, view: string) => {
    dispatch({ type: "SET_ACTIVE_VIEW", payload: view })
  },
  addAlert: (
    dispatch: React.Dispatch<AdminAction>,
    message: string,
    type: "success" | "error" | "warning" = "success",
  ) => {
    const id = Date.now().toString()
    dispatch({
      type: "ADD_ALERT",
      payload: { id, message, type },
    })
    // Auto-remove after 5 seconds
    setTimeout(() => {
      dispatch({ type: "REMOVE_ALERT", payload: id })
    }, 5000)
  },
  removeAlert: (dispatch: React.Dispatch<AdminAction>, id: string) => {
    dispatch({ type: "REMOVE_ALERT", payload: id })
  },
  addNotification: (dispatch: React.Dispatch<AdminAction>, message: string) => {
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: {
        id: Date.now().toString(),
        message,
        read: false,
        createdAt: new Date().toISOString(),
      },
    })
  },
  markNotificationRead: (dispatch: React.Dispatch<AdminAction>, id: string) => {
    dispatch({ type: "MARK_NOTIFICATION_READ", payload: id })
  },
}

// Provider component
export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState)

  return <AdminContext.Provider value={{ state, dispatch }}>{children}</AdminContext.Provider>
}

// Custom hook to use the admin context
export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}

