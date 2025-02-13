"use client";
import React, { useState } from 'react';
import ChatList from '../../components/ChatList';
import Chat from '../../components/Chat';

const ChatInterface: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const handleSelectChat = (room: string) => {
    setSelectedRoom(room);
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 border-r">
        <ChatList onSelectChat={handleSelectChat} />
      </div>
      <div className="w-3/4">
        {selectedRoom ? <Chat room={selectedRoom} /> : <div className="flex items-center justify-center h-full">Select a chat to start messaging</div>}
      </div>
    </div>
  );
};

export default ChatInterface;
