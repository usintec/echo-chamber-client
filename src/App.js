import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://clara-api.illuminance.tech/', { autoConnect: true }); // Single connection

export default function ChatApp() {
  const [roomId, setRoomId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const echo_url = "https://clara-api.illuminance.tech";
  useEffect(() => {
    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
  
    socket.on('newMessage', handleNewMessage);
  
    return () => {
      socket.off('newMessage', handleNewMessage); // ✅ Prevent duplicate listeners
    };
  }, []);
  

  const joinRoom = () => {
    if (roomId) {
      socket.emit('joinRoom', roomId);
    }
  };
  const sendMessage = async () => {
    if (!roomId || !message) return;
  
    // Prepare message payload
    const messagePayload = {
      aiAgentId: "1c9b599a-17b1-07cf-baf2-3eec09c1d56c",
      userId: "b4e9cad8-3ba1-0fbf-b00d-447f6fb26d4f",
      roomId: roomId,
      content: message,
    };
  
    try {
      // Send message via WebSocket
      socket.emit("message", { roomId, content: message });
  
      // Post message to API
      const response = await fetch(`${echo_url}/chat-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messagePayload),
      });
  
      if (!response.ok) {
        console.error("Failed to post message to API");
      }
  
      setMessage(""); // Clear input after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">Chat Room</h2>
      <input
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="border p-2 w-full mt-2"
      />
      <button onClick={joinRoom} className="bg-blue-500 text-white p-2 mt-2 w-full">Join Room</button>

      <div className="border p-4 mt-4 h-64 overflow-y-auto">
        {messages.map((msg, index) => (
          <p key={index}><strong>{msg.sender.username}:</strong> {msg.content}</p>
        ))}
      </div>

      <input
        type="text"
        placeholder="Type a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border p-2 w-full mt-2"
      />
      <button onClick={sendMessage} className="bg-green-500 text-white p-2 mt-2 w-full">Send</button>
    </div>
  );
}
