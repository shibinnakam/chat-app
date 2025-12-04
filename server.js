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

// ---------------- MongoDB Connection (Fix for Mongoose 8 + Node 22) ----------------
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// Create server for Socket.IO
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("🔌 A user connected");

  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });
});

// ---------------- API Routes ----------------

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

    // Emit message through WebSockets
    io.emit("newMessage", msg);

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
