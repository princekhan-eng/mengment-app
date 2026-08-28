import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
    if (!socket) {
        console.log("[SocketClient] Initializing Socket.io client...");
        socket = io({
            autoConnect: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        socket.on("connect", () => {
            console.log("[SocketClient] Connected to socket server. ID:", socket?.id);
        });

        socket.on("connect_error", (error) => {
            console.error("[SocketClient] Socket connection error:", error);
        });

        socket.on("disconnect", (reason) => {
            console.warn("[SocketClient] Socket disconnected. Reason:", reason);
        });
    }
    return socket;
}

export function disconnectSocket(): void {
    if (socket) {
        socket.disconnect();
        console.log("[SocketClient] Socket disconnected manually.");
        socket = null;
    }
}
