"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface ChatListProps {
  onSelectChat: (room: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat }) => {
  const [chatRooms, setChatRooms] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/chat-rooms/${user?.id}`);
        if (response.ok) {
          const data = await response.json();
          setChatRooms(data);
        }
      } catch (err) {
        console.error('Failed to fetch chat rooms:', err);
      }
    };

    fetchChatRooms();
  }, [user]);

  return (
    <div className="flex flex-col h-full bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Chats</h2>
      <div className="flex-1 overflow-y-auto">
        {chatRooms.map((room, index) => (
          <div
            key={index}
            className="p-3 border-b cursor-pointer hover:bg-gray-100"
            onClick={() => onSelectChat(room)}
          >
            {room}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
