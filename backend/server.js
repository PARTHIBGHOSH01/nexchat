require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const messageRoutes = require("./routes/messages");
const Message = require("./models/Message");
const { verifyToken } = require("./middleware/auth");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// REST Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => res.json({ status: "ChatApp API running" }));

// Socket.io — real-time logic
const onlineUsers = {}; // { userId: socketId }

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // User comes online
  socket.on("user_online", (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit("online_users", Object.keys(onlineUsers));
  });

  // Join a chat room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Leave a chat room
  socket.on("leave_room", (roomId) => {
    socket.leave(roomId);
  });

  // Send a message
  socket.on("send_message", async (data) => {
    try {
      const { roomId, senderId, senderName, text } = data;
      const message = await Message.create({
        room: roomId,
        sender: senderId,
        senderName,
        text,
      });
      // Broadcast to everyone in the room
      io.to(roomId).emit("receive_message", {
        _id: message._id,
        room: roomId,
        sender: senderId,
        senderName,
        text,
        createdAt: message.createdAt,
      });
    } catch (err) {
      console.error("send_message error:", err.message);
    }
  });

  // Typing indicator
  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("user_typing", { userName });
  });

  socket.on("stop_typing", ({ roomId }) => {
    socket.to(roomId).emit("user_stop_typing");
  });

  // Disconnect
  socket.on("disconnect", () => {
    for (const [userId, sid] of Object.entries(onlineUsers)) {
      if (sid === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }
    io.emit("online_users", Object.keys(onlineUsers));
    console.log("Socket disconnected:", socket.id);
  });
});

// Connect to MongoDB then start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
