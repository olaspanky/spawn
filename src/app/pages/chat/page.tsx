"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useChatStore } from "../../store/useChatStore"; // Ensure correct path
import Sidebar from "../../components/Sidebar";
import NoChatSelected from "../../components/NoChatSelected";
import ChatContainer from "../../components/ChatContainer";

const ChatPageContent: React.FC = () => {
  const { selectedUser, setSelectedUserById, getUsers } = useChatStore();
  const searchParams = useSearchParams();
  const sellerId = searchParams.get("sellerId");

  useEffect(() => {
    const handleIncomingChat = async () => {
      if (sellerId) {
        try {
          await getUsers();
          await setSelectedUserById(sellerId);
          window.history.replaceState({}, "", "/pages/chat");
        } catch (error) {
          console.error("Error setting up chat:", error);
        }
      }
    };

    handleIncomingChat();
  }, [sellerId, getUsers, setSelectedUserById]);

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap in Suspense to fix Next.js error
const ChatPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatPageContent />
    </Suspense>
  );
};

export default ChatPage;
