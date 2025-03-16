import { createServer } from "http";
import { Server } from "socket.io";

const port = process.env.PORT || 3001;  // Use dynamic port for deployment
const userSocketMap = new Map();
const socketUserMap = new Map();
const roomUsers = new Map();  // Add roomUsers map

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",  // Allow all origins (for testing, secure this later)
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,  // Allow credentials if needed (e.g., cookies, authorization headers)
  }
});

io.on("connection", (socket) => {
  let currentRoom = "";

  // Handle joining a room
  socket.on("joinRoom", ({ userId, roomId }) => {
    if (!userId || !roomId) return;

    socketUserMap.set(socket.id, userId);

    // Leave previous room if exists
    if (currentRoom) {
      socket.leave(currentRoom);
      if (roomUsers.has(currentRoom)) {
        roomUsers.get(currentRoom).delete(userId);
        io.to(currentRoom).emit("user_count", roomUsers.get(currentRoom).size);
        io.to(currentRoom).emit("listofusers", Array.from(roomUsers.get(currentRoom)));
      }
    }

    // Join the new room
    currentRoom = roomId;
    socket.join(roomId);

    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set());
    }
    roomUsers.get(roomId).add(userId);

    // Emit updated user count and list to all in the room
    io.to(roomId).emit("user_count", roomUsers.get(roomId).size);
    io.to(roomId).emit("listofusers", Array.from(roomUsers.get(roomId)));

    io.to(roomId).emit("message", {
      roomId,
      username: "Server",
      message: `User ${userId} joined room ${roomId}`,
    });
  });

  socket.on("hello", (message) => {
    const useridandmessage = message.split("#1!2@$");
    const userid = useridandmessage[0];

    if (useridandmessage.length > 1) {
      const remainingmessage = useridandmessage[1];
      if (remainingmessage && currentRoom) {
        io.to(currentRoom).emit("world", `${userid}#1!2@$${remainingmessage}`);
      }
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    const userId = socketUserMap.get(socket.id);

    if (currentRoom && userId) {
      if (roomUsers.has(currentRoom)) {
        roomUsers.get(currentRoom).delete(userId);
        io.to(currentRoom).emit("user_count", roomUsers.get(currentRoom).size);
        io.to(currentRoom).emit("listofusers", Array.from(roomUsers.get(currentRoom)));
        io.to(currentRoom).emit("message", {
          roomId: currentRoom,
          username: "Server",
          message: `User ${userId} left room ${currentRoom}`,
        });
      }
    }
    socketUserMap.delete(socket.id); // Clean up socketUserMap
  });
});

httpServer.listen(port, () => {
  console.log(`🚀 WebSocket server running on port ${port}`);
});

