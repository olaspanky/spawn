import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { ChatStore, AuthStore, Message } from "../types/chat";
import io, { Socket } from "socket.io-client";

interface ChatContainerProps {
  className?: string;
  onBack?: () => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ className, onBack }) => {
  const {
    messages,
    getMessages,
    setMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore() as ChatStore;

  const { authUser } = useAuthStore() as AuthStore;
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<any>(null);

  

  useEffect(() => {
    if (!selectedUser?._id) return;

    // Initialize Socket.IO connection
    socketRef.current = io("https://chatapp-jwtsecret.up.railway.app", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to socket:", socketRef.current.id);
      socketRef.current.emit("joinChat", selectedUser._id);
    });

    socketRef.current.on("newMessage", (newMessage: any) => {
      setMessages((prevMessages: Message[]) => [...prevMessages, newMessage as Message]); // Use functional update
      console.log("Received new message:", newMessage);
    });

    socketRef.current.on("connect_error", (error: Error) => {
      console.error("Socket connection error:", error.message);
    });

    socketRef.current.on("disconnect", (reason: string) => {
      console.log("Socket disconnected:", reason);
    });

    getMessages(selectedUser._id); // Initial fetch

    return () => {
      socketRef.current.disconnect();
      unsubscribeFromMessages();
    };
  }, [selectedUser?._id, getMessages, setMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className={`flex-1 flex flex-col overflow-auto ${className || ""}`}>
        <ChatHeader onBack={onBack} />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col overflow-auto ${className || ""}`}>
      <ChatHeader onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser?._id ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser?._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser?.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;