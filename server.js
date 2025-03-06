import { createServer } from "http";
import { Server } from "socket.io";

const port = process.env.PORT || 3001;  // Use dynamic port for deployment

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",  // Allow all origins (for testing, secure this later)
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("✅ WebSocket connection succeeded");

  socket.on("hello", (message) => {
    console.log("Received chat message:", message);
    const useridandmessage = message.split("2@2@3#1!");
    const userid =useridandmessage[0];
    if(useridandmessage.length>1){
      const remainingmessage = useridandmessage[1];
      if(remainingmessage){
        io.emit("world", `${userid} : ${remainingmessage}`); 
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
  });
});

httpServer.listen(port, () => {
  console.log(`🚀 WebSocket server running on port ${port}`);
});
