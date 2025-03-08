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
  console.log("WebSocket connection succeeded");

  socket.on("user_joined", (data) => {  
    const { userId } = data;
    
    // Track this socket for this user
    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId).add(socket.id);
    
    // Also save reverse mapping for quick lookup on disconnect
    socketUserMap.set(socket.id, userId);

    // Emit the count of unique users (not socket connections)
    io.emit("user_count", userSocketMap.size);
  });
  
  // Listen for "hello" messages from clients
  socket.on("hello", (message) => {
    const useridandmessage = message.split("#1!2@$");
    const userid = useridandmessage[0];
    if(useridandmessage.length > 1){
      const remainingmessage = useridandmessage[1];
      if(remainingmessage){
        io.emit("world", `${userid}#1!2@$${remainingmessage}`); 
      }
    }
  });

  socket.on("disconnect", () => {
    // Get the userId for this socket
    const userId = socketUserMap.get(socket.id);
    
    if (userId) {
      // Remove this socket from the user's set of sockets
      const userSockets = userSocketMap.get(userId);
      userSockets.delete(socket.id);
      
      // If the user has no more connected sockets, remove the user entirely
      if (userSockets.size === 0) {
        userSocketMap.delete(userId);
      }
      
      // Clean up the reverse mapping
      socketUserMap.delete(socket.id);
      
      // Update the user count
      io.emit("user_count", userSocketMap.size);
    }
    
    console.log("User disconnected");
  });
});

httpServer.listen(port, () => {
  console.log(`🚀 WebSocket server running on port ${port}`);
});
