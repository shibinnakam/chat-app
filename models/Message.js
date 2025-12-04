const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    text: { type: String, required: true },
    time: { type: Date, default: Date.now },
    
    // NEW FIELD — for read receipts ✓✓
    read: { type: Boolean, default: false }
});

module.exports = mongoose.model("Message", MessageSchema);
