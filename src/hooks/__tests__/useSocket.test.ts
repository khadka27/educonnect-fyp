const { renderHook, act } = require("@testing-library/react");
const { useSocket } = require("../useSocket");
const { connect } = require("socket.io-client");

// Mock socket.io-client
jest.mock("socket.io-client", () => ({
  connect: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

describe("useSocket", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("should initialize socket connection", () => {
    const { result } = renderHook(() => useSocket());

    expect(connect).toHaveBeenCalledWith(process.env.NEXT_PUBLIC_SOCKET_URL, {
      autoConnect: false,
    });
    expect(result.current.socket).toBeDefined();
  });

  it("should connect to socket when connect is called", () => {
    const { result } = renderHook(() => useSocket());

    act(() => {
      result.current.connect();
    });

    expect(result.current.socket?.connect).toHaveBeenCalled();
  });

  it("should disconnect from socket when disconnect is called", () => {
    const { result } = renderHook(() => useSocket());

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.socket?.disconnect).toHaveBeenCalled();
  });

  it("should emit events", () => {
    const { result } = renderHook(() => useSocket());
    const eventName = "test-event";
    const eventData = { test: "data" };

    act(() => {
      result.current.emit(eventName, eventData);
    });

    expect(result.current.socket?.emit).toHaveBeenCalledWith(
      eventName,
      eventData
    );
  });

  it("should handle socket events", () => {
    const { result } = renderHook(() => useSocket());
    const eventName = "test-event";
    const callback = jest.fn();

    act(() => {
      result.current.on(eventName, callback);
    });

    expect(result.current.socket?.on).toHaveBeenCalledWith(eventName, callback);
  });
});
