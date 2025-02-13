"use client";
import React, { useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';
import { ChatMessage } from '../types/chat';
import { useAuth } from '../context/AuthContext';

interface ChatProps {
  room: string;
}

const Chat: React.FC<ChatProps> = ({ room }) => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socket = useSocket('http://localhost:5000'); // Replace with your backend URL
  const { user } = useAuth();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/messages/${room}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    fetchMessages();

    if (socket) {
      socket.emit('joinRoom', room);

      socket.on('receiveMessage', (data: ChatMessage) => {
        setMessages((prevMessages) => [...prevMessages, data]);
      });
    }

    return () => {
      if (socket) {
        socket.off('receiveMessage');
      }
    };
  }, [socket, room]);

  const sendMessage = async () => {
    if (socket && message.trim() && user) {
      const newMessage: ChatMessage = {
        sender: user.name,
        message,
      };

      try {
        const response = await fetch('http://localhost:5000/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room, ...newMessage }),
        });

        if (response.ok) {
          const data = await response.json();
          socket.emit('sendMessage', data);
          setMessages((prevMessages) => [...prevMessages, data]);
          setMessage('');
        }
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    }
  };

  return (
    <div className="flex flex-col h-[400px] bg-white p-4 rounded-lg shadow-md">
      <div className="flex-1 h-[400px] overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`p-2 mb-2 rounded-lg ${msg.sender === user?.name ? 'bg-blue-200 text-right' : 'bg-gray-200'}`}>
            <strong>{msg.sender}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-l-lg"
        />
        <button
          onClick={sendMessage}
          className="p-2 bg-blue-500 text-white rounded-r-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
