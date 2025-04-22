const { renderHook, act } = require("@testing-library/react");
const { useChat } = require("../useChat");
const { useSocket } = require("../useSocket");

// Mock the useSocket hook
jest.mock("../useSocket");

describe("useChat", () => {
  const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useSocket.mockReturnValue({
      socket: mockSocket,
      connect: jest.fn(),
      disconnect: jest.fn(),
      emit: jest.fn(),
      on: jest.fn(),
    });
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should connect to socket when connect is called", () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.connect();
    });

    expect(mockSocket.connect).toHaveBeenCalled();
  });

  it("should disconnect from socket when disconnect is called", () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.disconnect();
    });

    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it("should send messages", () => {
    const { result } = renderHook(() => useChat());
    const message = { text: "Hello", sender: "user1" };

    act(() => {
      result.current.sendMessage(message);
    });

    expect(mockSocket.emit).toHaveBeenCalledWith("chat:message", message);
  });

  it("should handle incoming messages", () => {
    const { result } = renderHook(() => useChat());
    const message = { text: "Hello", sender: "user1" };

    // Simulate receiving a message
    act(() => {
      const messageCallback = mockSocket.on.mock.calls.find(
        (call) => call[0] === "chat:message"
      )?.[1];
      if (messageCallback) {
        messageCallback(message);
      }
    });

    expect(result.current.messages).toContainEqual(message);
  });

  it("should handle connection status changes", () => {
    const { result } = renderHook(() => useChat());

    // Simulate connection
    act(() => {
      const connectCallback = mockSocket.on.mock.calls.find(
        (call) => call[0] === "connect"
      )?.[1];
      if (connectCallback) {
        connectCallback();
      }
    });

    expect(result.current.isConnected).toBe(true);

    // Simulate disconnection
    act(() => {
      const disconnectCallback = mockSocket.on.mock.calls.find(
        (call) => call[0] === "disconnect"
      )?.[1];
      if (disconnectCallback) {
        disconnectCallback();
      }
    });

    expect(result.current.isConnected).toBe(false);
  });

  it("should handle errors", () => {
    const { result } = renderHook(() => useChat());
    const error = new Error("Connection failed");

    // Simulate error
    act(() => {
      const errorCallback = mockSocket.on.mock.calls.find(
        (call) => call[0] === "error"
      )?.[1];
      if (errorCallback) {
        errorCallback(error);
      }
    });

    expect(result.current.error).toBe(error);
  });
});
