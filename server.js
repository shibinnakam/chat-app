const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Express app
const app = express();
app.use(cors());
app.use(express.json());

// Load Message model
const Message = require("./models/Message");

// ---------------- MongoDB Connection ----------------
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// ---------------- Socket.IO Setup ----------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Store online users
let onlineUsers = {};

io.on("connection", (socket) => {
  console.log("🔌 A user connected");

  // ------- USER COMES ONLINE -------
  socket.on("userOnline", (name) => {
    onlineUsers[name] = socket.id;
    io.emit("onlineUsers", onlineUsers);
  });

  // ------- TYPING INDICATOR -------
  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  // ------- MARK MESSAGE READ -------
  socket.on("markRead", async (msgId) => {
    await Message.findByIdAndUpdate(msgId, { read: true });
    io.emit("readReceipt", msgId);
  });

  // ------- USER DISCONNECT -------
  socket.on("disconnect", () => {
    for (let user in onlineUsers) {
      if (onlineUsers[user] === socket.id) delete onlineUsers[user];
    }
    io.emit("onlineUsers", onlineUsers);

    console.log("❌ User disconnected");
  });
});

// ---------------- API Routes ----------------

// Render homepage so Render does not show "Cannot GET /"
app.get("/", (req, res) => {
  res.send("Chat App Backend is Running 🚀");
});

// Get all messages
app.get("/messages", async (req, res) => {
  try {
    const msgs = await Message.find().sort({ time: 1 });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: "Error fetching messages" });
  }
});

// Send a message
app.post("/messages", async (req, res) => {
  try {
    const msg = await Message.create(req.body);

    // Emit real-time message
    io.emit("newMessage", msg);

    // Auto-delete from DB after 30 seconds
    setTimeout(async () => {
      await Message.findByIdAndDelete(msg._id);
      io.emit("deleteMessage", msg._id);
    }, 30000);

    res.json({ success: true, message: "Message sent", data: msg });
  } catch (err) {
    res.status(500).json({ error: "Error sending message" });
  }
});

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
