import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function Sidebar({ selectedChat, setSelectedChat }) {
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const { user, logout } = useAuth();
  const { online } = useSocket();

  const loadChats = async () => {
    const { data } = await API.get("/chats");
    setChats(data);
  };

  useEffect(() => { loadChats(); }, []);

  const searchUsers = async (q) => {
    setSearch(q);
    if (!q) return setUsers([]);
    const { data } = await API.get(`/auth/users?search=${q}`);
    setUsers(data);
  };

  const accessChat = async (userId) => {
    const { data } = await API.post("/chats", { userId });
    setUsers([]); setSearch("");
    if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
    setSelectedChat(data);
  };

  return (
    <div className="w-80 bg-white border-r flex flex-col">
      <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
        <h2 className="font-bold text-lg">💬 {user?.name}</h2>
        <button onClick={logout} className="text-sm bg-white/20 px-3 py-1 rounded">Logout</button>
      </div>
      <input value={search} onChange={(e) => searchUsers(e.target.value)}
        placeholder="Search users..." className="m-3 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
      <div className="flex-1 overflow-y-auto">
        {users.length > 0 ? users.map((u) => (
          <div key={u._id} onClick={() => accessChat(u._id)}
            className="p-3 hover:bg-indigo-50 cursor-pointer border-b flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
              {u.name[0]}
            </div>
            <div>
              <p className="font-semibold">{u.name}</p>
              <p className="text-xs text-gray-500">{u.email}</p>
            </div>
          </div>
        )) : chats.map((c) => {
          const other = c.users.find((x) => x._id !== user._id);
          const isOnline = online.includes(other?._id);
          return (
            <div key={c._id} onClick={() => setSelectedChat(c)}
              className={`p-3 cursor-pointer border-b flex items-center gap-3 ${selectedChat?._id === c._id ? "bg-indigo-100" : "hover:bg-gray-50"}`}>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                  {c.isGroupChat ? "G" : other?.name[0]}
                </div>
                {!c.isGroupChat && (
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-gray-400"}`}></span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{c.isGroupChat ? c.chatName : other?.name}</p>
                <p className="text-xs text-gray-500 truncate">{c.latestMessage?.content || "No messages yet"}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
