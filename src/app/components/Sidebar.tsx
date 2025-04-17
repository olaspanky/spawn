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
            <div  key={user._id}>
            <button
             
              onClick={() => {
                setSelectedUser(user);
                onChatSelect(); // Trigger chat open on mobile
              }}
              className={`
                w-full p-3 flex items-left lg:items-center gap-3
                hover:bg-base-300 transition-colors
                ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
              `}
            >
              <div className="relative lg:mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.username}
                  className="size-12 object-cover rounded-full"
                />
                {onlineUsers.includes(user._id.toString()) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                )}
              </div>
              <div className="block text-left min-w-0">
                <div className="font-medium truncate">{user.username}</div>
                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(user._id.toString()) ? "Online" : "Offline"}
                </div>
              </div>
            </button>

            <div className="h-[0.25px] bg-gray-50 m-1"></div>
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