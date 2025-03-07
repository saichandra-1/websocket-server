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
  console.log("WebSocket connection succeeded");
  
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
    console.log("User disconnected");
  });
});

httpServer.listen(port, () => {
  console.log(`🚀 WebSocket server running on port ${port}`);
});
