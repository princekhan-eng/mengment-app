const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    // Track online users: userId -> { socketId, userId, name, role }
    const onlineUsers = new Map();

    io.on("connection", (socket) => {
        console.log(`[Socket.io] Client connected: ${socket.id}`);

        // User connects & registers online status
        socket.on("user_online", (userData) => {
            if (!userData || !userData.userId) return;

            socket.userId = userData.userId;
            socket.join(`user_${userData.userId}`);

            onlineUsers.set(userData.userId, {
                socketId: socket.id,
                userId: userData.userId,
                name: userData.name || "Team Member",
                role: userData.role || "member",
                lastSeen: new Date(),
            });

            console.log(`[Socket.io] User online: ${userData.name} (${userData.userId})`);
            io.emit("online_users_list", Array.from(onlineUsers.values()));
        });

        // Join specific channel / direct chat room
        socket.on("join_room", (roomId) => {
            if (!roomId) return;
            socket.join(roomId);
            console.log(`[Socket.io] Socket ${socket.id} joined room: ${roomId}`);
        });

        // Leave room
        socket.on("leave_room", (roomId) => {
            if (!roomId) return;
            socket.leave(roomId);
        });

        // Handle sending chat messages
        socket.on("send_message", (messageData) => {
            if (!messageData || !messageData.roomId) return;

            console.log(`[Socket.io] Message in room ${messageData.roomId} from ${messageData.senderName}`);
            
            // Broadcast to everyone in the room (including sender)
            io.to(messageData.roomId).emit("receive_message", messageData);

            // If it's a direct message to a recipient, also trigger notification to receiver's user room
            if (messageData.receiverId) {
                io.to(`user_${messageData.receiverId}`).emit("new_notification", {
                    type: "new_message",
                    title: `New message from ${messageData.senderName}`,
                    message: messageData.content || "Sent an attachment",
                    link: "/dashboard/manager", // or current dashboard
                    createdAt: new Date(),
                });
            }
        });

        // Typing indicators
        socket.on("typing", ({ roomId, senderName }) => {
            socket.to(roomId).emit("user_typing", { roomId, senderName });
        });

        socket.on("stop_typing", ({ roomId }) => {
            socket.to(roomId).emit("user_stop_typing", { roomId });
        });

        // Real-time task update notification
        socket.on("task_updated", (taskData) => {
            console.log(`[Socket.io] Task updated: ${taskData.title} -> ${taskData.status}`);
            
            // Broadcast to recipient or manager room
            if (taskData.assignedBy) {
                io.to(`user_${taskData.assignedBy}`).emit("new_notification", {
                    type: "task_updated",
                    title: `Task Status Updated: ${taskData.title}`,
                    message: `Task is now "${taskData.status.toUpperCase()}"`,
                    createdAt: new Date(),
                });
            }

            if (taskData.assignedTo) {
                io.to(`user_${taskData.assignedTo}`).emit("new_notification", {
                    type: "task_assigned",
                    title: `Task Updated: ${taskData.title}`,
                    message: `Status updated to ${taskData.status}`,
                    createdAt: new Date(),
                });
            }

            io.emit("task_list_refresh", taskData);
        });

        // Direct notification event
        socket.on("send_notification", (notifData) => {
            if (notifData && notifData.recipientId) {
                io.to(`user_${notifData.recipientId}`).emit("new_notification", notifData);
            }
        });

        // Disconnect
        socket.on("disconnect", () => {
            console.log(`[Socket.io] Client disconnected: ${socket.id}`);
            if (socket.userId) {
                onlineUsers.delete(socket.userId);
                io.emit("online_users_list", Array.from(onlineUsers.values()));
            }
        });
    });

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> ManageHub Server running on http://${hostname}:${port}`);
    });
});
