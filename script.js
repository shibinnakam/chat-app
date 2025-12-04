const socket = io("https://your-render-backend-url"); // Put Render backend URL

function send() {
    const data = {
        sender: document.getElementById("sender").value,
        receiver: document.getElementById("receiver").value,
        text: document.getElementById("msg").value
    };

    fetch("https://your-render-backend-url/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

socket.on("newMessage", (msg) => {
    document.getElementById("chat").innerHTML += `<p>${msg.sender}: ${msg.text}</p>`;
});
