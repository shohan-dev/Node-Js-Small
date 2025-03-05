import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

function App() {
  const [message, setMessage] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [joinedRoom, setJoinedRoom] = useState("");
  const [messagesByRoom, setMessagesByRoom] = useState({});

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected", socket.id);
    });

    socket.on("message", (data) => {
      setMessagesByRoom((prev) => {
        const roomName = data.room || "general";
        const roomMessages = prev[roomName] ? [...prev[roomName], data] : [data];
        return { ...prev, [roomName]: roomMessages };
      });
    });

    socket.on("join", (data) => {
      console.log(`User ${data.userId} joined room ${data.room}`);
    });

    return () => {
      socket.off("message");
      socket.off("join");
    };
  }, []);

  const sendMessage = () => {
    if (!joinedRoom) {
      alert("Please join a room first.");
      return;
    }
    if (message.trim()) {
      socket.emit("message", { text: message, room: joinedRoom });
      setMessage(""); // Clear input after sending
    }
  };

  const joinRoom = () => {
    if (roomInput.trim()) {
      socket.emit("join", { room: roomInput });
      setJoinedRoom(roomInput);
      setRoomInput("");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <p>Socket.IO Chat</p>
      <p><strong>Your ID:</strong> {socket.id}</p>

      {!joinedRoom ? (
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="Enter room name"
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <p>
          <strong>Joined Room:</strong> {joinedRoom}
        </p>
      )}

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      {Object.keys(messagesByRoom).map((room) => (
        <div key={room} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}>
          <h3>Room: {room}</h3>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {messagesByRoom[room].map((msg, index) => (
              <li key={index}>
                <strong>{msg.userId}:</strong> {msg.text}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default App;
