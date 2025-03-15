import { createServer } from "http";
import { Server } from "socket.io";

const port = process.env.PORT || 3001;  // Use dynamic port for deployment
const userSocketMap = new Map();
const socketUserMap = new Map();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",  // Allow all origins (for testing, secure this  later)
    methods: ["GET", "POST"]
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
        }
      }

      // Join the new room
      currentRoom = roomId;
      socket.join(roomId);

      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Set());
      }
      roomUsers.get(roomId).add(userId);

      io.to(roomId).emit("user_count", roomUsers.get(roomId).size);
      console.log(`User ${userId} joined room: ${roomId}`);

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
      console.log(socketUserMap)
      const userId = socketUserMap.get(socket.id);

      if (currentRoom && userId) {
        if (roomUsers.has(currentRoom)) {
          roomUsers.get(currentRoom).delete(userId);
          io.to(currentRoom).emit("user_count", roomUsers.get(currentRoom).size);
        }
      }
      console.log(`User ${userId} disconnected`);
    });
  });

httpServer.listen(port, () => {
  console.log(`🚀 WebSocket server running on port ${port}`);
});
