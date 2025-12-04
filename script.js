// Connect Socket.IO to your Render backend
const socket = io("https://chat-app-876w.onrender.com");

// Send message
function send() {
    const sender = document.getElementById("sender").value;
    const receiver = document.getElementById("receiver").value;
    const text = document.getElementById("msg").value;

    if (!sender || !receiver || !text) {
        alert("Please fill all fields");
        return;
    }

    const data = { sender, receiver, text };

    // Store in database + send through WebSocket
    fetch("https://chat-app-876w.onrender.com/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    document.getElementById("msg").value = "";
}

// When receiving real-time messages
socket.on("newMessage", (msg) => {
    addMessage(msg);
});

// Show message in chat box
function addMessage(msg) {
    document.getElementById("chat").innerHTML += 
        `<p><b>${msg.sender}:</b> ${msg.text}</p>`;
}

// Load old messages on page load
window.onload = function () {
    fetch("https://chat-app-876w.onrender.com/messages")
        .then(res => res.json())
        .then(data => {
            data.forEach(m => addMessage(m));
        });
};
