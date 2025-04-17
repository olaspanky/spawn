"use client";

import { useEffect, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useChatStore } from "../../store/useChatStore";
import Sidebar from "../../components/Sidebar";
import NoChatSelected from "../../components/NoChatSelected";
import ChatContainer from "../../components/ChatContainer";

const ChatPageContent: React.FC = () => {
  const { selectedUser, setSelectedUserById, getUsers } = useChatStore();
  const searchParams = useSearchParams();
  const sellerId = searchParams.get("sellerId");
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const handleIncomingChat = async () => {
      if (sellerId) {
        try {
          await getUsers();
          await setSelectedUserById(sellerId);
          setIsChatOpen(true);
          window.history.replaceState({}, "", "/pages/chat");
        } catch (error) {
          console.error("Error setting up chat:", error);
        }
      }
    };

    handleIncomingChat();
  }, [sellerId, getUsers, setSelectedUserById]);

  const handleBackToSidebar = () => {
    setIsChatOpen(false);
    setSelectedUserById("");
  };

  const handleChatSelect = () => {
    setIsChatOpen(true);
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          {isMobile ? (
            !isChatOpen ? (
              <div className="h-full overflow-y-auto">
                <Sidebar onChatSelect={handleChatSelect} />
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {!selectedUser ? (
                  <NoChatSelected />
                ) : (
                  <ChatContainer
                    className="flex-1"
                    onBack={handleBackToSidebar}
                  />
                )}
              </div>
            )
          ) : (
            <div className="flex h-full rounded-lg overflow-hidden">
              <Sidebar onChatSelect={() => {}} />
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading chats...</div>}>
      <ChatPageContent />
    </Suspense>
  );
};

export default ChatPage;