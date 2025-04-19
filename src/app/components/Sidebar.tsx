import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import { ChatStore, AuthStore } from "../types/chat";

interface SidebarProps {
  onChatSelect: () => void; // Prop for mobile chat navigation
}

const Sidebar: React.FC<SidebarProps> = ({ onChatSelect }) => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore() as ChatStore;
  const { onlineUsers, authUser } = useAuthStore() as AuthStore; // Added authUser
  const [showOnlineOnly, setShowOnlineOnly] = useState<boolean>(false);

  console.log("🔵 All users:", users);
  console.log("🟢 Online Users:", onlineUsers);
  console.log("🟤 Auth User:", authUser);

  useEffect(() => {
    console.log("🟡 Sidebar updated! Online Users:", onlineUsers);
  }, [onlineUsers]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Filter out the authenticated user from the list
  const filteredUsers = (showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id.toString()))
    : users
  ).filter((user) => user._id.toString() !== authUser?._id?.toString());

  console.log("🟣 Filtered Users (Visible):", filteredUsers);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({Math.max(0, onlineUsers.length - 1)} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user._id} className="px-2">
            <button
              onClick={() => {
                setSelectedUser(user);
                onChatSelect();
              }}
              className={`
                w-full p-3 flex items-center gap-3 rounded-lg
                hover:bg-base-200 transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-primary
                ${selectedUser?._id === user._id ? "bg-base-200 ring-1 ring-base-300" : ""}
              `}
              aria-label={`Chat with ${user.username}`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={`${user.username}'s profile`}
                  className="size-10 sm:size-12 object-cover rounded-full"
                  loading="lazy"
                />
                {onlineUsers.includes(user._id.toString()) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-medium text-sm sm:text-base truncate">{user.username}</div>
                <div className="text-xs sm:text-sm text-base-content/70">
                  {onlineUsers.includes(user._id.toString()) ? "Online" : "Offline"}
                </div>
              </div>
            </button>
            <div className="h-px bg-base-200 my-1 mx-3" />
          </div>
          ))
        ) : (
          <div className="text-center text-zinc-500 py-4">No users available</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;