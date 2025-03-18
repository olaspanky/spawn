import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { ChatStore, AuthStore } from "../types/chat";

interface ChatHeaderProps {
  onBack?: () => void; // Added for mobile back navigation
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onBack }) => {
  const { selectedUser, setSelectedUser } = useChatStore() as ChatStore;
  const { onlineUsers } = useAuthStore() as AuthStore;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="p-2.5 border-b border-base-300 bg-base-100 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobile && onBack && (
            <button
              onClick={onBack}
              className="btn btn-sm btn-ghost p-1 hover:bg-base-200 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 shadow-sm"
              aria-label="Back to Chats"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5 text-base-content/70"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser?.profilePic || "/avatar.png"}
                alt={selectedUser?.username || "User"}
              />
            </div>
          </div>
          <div>
            <h3 className="font-medium">{selectedUser?.username}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser?._id ?? "") ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setSelectedUser(null)}
          className="hidden bg-flex btn btn-sm btn-ghost p-1 hover:bg-base-200 rounded-full"
          aria-label="Close chat"
        >
          <X className="w-5 h-5 text-base-content/70" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;