import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { Settings, MoreVertical, Search, LogOut, CheckCheck, CircleUserRound } from "lucide-react";

const ICON_CHAT =
  "M240-384h336v-72H240v72Zm0-132h480v-72H240v72Zm0-132h480v-72H240v72ZM96-96v-696q0-29.7 21.15-50.85Q138.3-864 168-864h624q29.7 0 50.85 21.15Q864-821.7 864-792v480q0 29.7-21.15 50.85Q821.7-240 792-240H240L96-96Zm114-216h582v-480H168v522l42-42Zm-42 0v-480 480Z";
const ICON_CALL =
  "M763-145q-121-9-229.5-59.5T339-341q-86-86-135.5-194T144-764q-2-21 12.29-36.5Q170.57-816 192-816h136q17 0 29.5 10.5T374-779l24 106q2 13-1.5 25T385-628l-97 98q20 38 46 73t57.97 65.98Q422-361 456-335.5q34 25.5 72 45.5l99-96q8-8 20-11.5t25-1.5l107 23q17 5 27 17.5t10 29.5v136q0 21.43-16 35.71Q784-143 763-145ZM255-600l70-70-17.16-74H218q5 38 14 73.5t23 70.5Zm344 344q35.1 14.24 71.55 22.62Q707-225 744-220v-90l-75-16-70 70ZM255-600Zm344 344Z";
const ICON_COMMUNITY =
  "M0-240v-59q0-51 45-80t123-29q15 0 30 1.5t30 4.5q-17 20-26.5 45t-9.5 50.56V-240H0Zm240 0v-61q0-27.86 14.5-50.93T293-387q44-22 91-33.5t95.53-11.5Q529-432 576-420.5t91 33.5q24 12 38.5 35.07T720-301v61H240Zm528 0v-67.37q0-26.95-9.5-50.79T732-402q17-3 31.5-4.5T792-408q78 0 123 29t45 80v59H768Zm-454-72h332q-7-17-59.5-32.5T480-360q-54 0-106.5 15.5T314-312ZM167.79-456Q138-456 117-477.03q-21-21.02-21-50.55Q96-558 117.03-579q21.02-21 50.55-21Q198-600 219-579.24t21 51.45Q240-498 219.24-477t-51.45 21Zm624 0Q762-456 741-477.03q-21-21.02-21-50.55Q720-558 741.03-579q21.02-21 50.55-21Q822-600 843-579.24t21 51.45Q864-498 843.24-477t-51.45 21ZM479.5-480q-49.5 0-84.5-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85.5q0 49.5-35 84.5t-85.5 35Zm.5-72q20.4 0 34.2-13.8Q528-579.6 528-600q0-20.4-13.8-34.2Q500.4-648 480-648q-20.4 0-34.2 13.8Q432-620.4 432-600q0 20.4 13.8 34.2Q459.6-552 480-552Zm0 240Zm0-288Z";
const ICON_ARCHIVE =
  "m480-276 144-144-51-51-57 57v-150h-72v150l-57-57-51 51 144 144ZM216-624v408h528v-408H216Zm0 480q-29.7 0-50.85-21.15Q144-186.3 144-216v-474q0-14 5.25-27T165-741l54-54q11-11 23.94-16 12.94-5 27.06-5h420q14.12 0 27.06 5T741-795l54 54q10.5 11 15.75 24t5.25 27v474q0 29.7-21.15 50.85Q773.7-144 744-144H216Zm6-552h516l-48-48H270l-48 48Zm258 276Z";
const ICON_NEW_CHAT =
  "M444-384h72v-132h132v-72H516v-132h-72v132H312v72h132v132ZM96-96v-696q0-29.7 21.15-50.85Q138.3-864 168-864h624q29.7 0 50.85 21.15Q864-821.7 864-792v480q0 29.7-21.15 50.85Q821.7-240 792-240H240L96-96Zm114-216h582v-480H168v522l42-42Zm-42 0v-480 480Z";

function MaterialIcon({ path, size = 20 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height={`${size}px`} viewBox="0 -960 960 960" width={`${size}px`} fill="#e3e3e3">
      <path d={path} />
    </svg>
  );
}

export default function Sidebar({ selectedChat, setSelectedChat }) {
  const [chats, setChats] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all"); // all | unread | favourites | groups
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { online, socket } = useSocket();

  const loadChats = async () => {
    const { data } = await API.get("/chats");
    setChats(data);
  };

  const loadAllUsers = async () => {
    const { data } = await API.get("/auth/users");
    setAllUsers(data.filter((u) => u._id !== user._id));
  };

  useEffect(() => {
    loadChats();
    loadAllUsers();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      setChats((prev) => {
        const exists = prev.find((c) => c._id === msg.chat._id);
        if (!exists) {
          loadChats();
          return prev;
        }
        const isCurrentlyOpen = selectedChat?._id === msg.chat._id;
        const updated = prev.map((c) =>
          c._id === msg.chat._id
            ? {
                ...c,
                latestMessage: msg,
                unreadCount: isCurrentlyOpen ? 0 : (c.unreadCount || 0) + 1,
              }
            : c
        );
        return [...updated].sort((a, b) =>
          a._id === msg.chat._id ? -1 : b._id === msg.chat._id ? 1 : 0
        );
      });
    };
    socket.on("message-received", handler);
    return () => socket.off("message-received", handler);
  }, [socket, selectedChat]);

  const searchUsers = async (q) => {
    setSearch(q);
    if (!q) return setSearchResults([]);
    const { data } = await API.get(`/auth/users?search=${q}`);
    setSearchResults(data.filter((u) => u._id !== user._id));
  };

  const accessChat = async (userId) => {
    const { data } = await API.post("/chats", { userId });
    setSearchResults([]);
    setSearch("");
    setChats((prev) => (prev.find((c) => c._id === data._id) ? prev : [data, ...prev]));
    setSelectedChat(data);
  };

  const listItems = useMemo(() => {
    const chattedUserIds = new Set(
      chats.map((c) => c.users.find((x) => x._id !== user._id)?._id).filter(Boolean)
    );

    const chatItems = chats.map((c) => {
      const other = c.users.find((x) => x._id !== user._id);
      return {
        type: "chat",
        key: c._id,
        chat: c,
        userId: other?._id,
        isGroup: c.isGroupChat,
        name: c.isGroupChat ? c.chatName : other?.name,
        avatarLetter: c.isGroupChat ? "G" : other?.name?.[0],
        lastMessage: c.latestMessage?.content || "No messages yet",
        lastMessageTime: c.latestMessage?.createdAt,
        lastMessageSender: c.latestMessage?.sender,
        unreadCount: c.unreadCount || 0,
      };
    });

    const noChatUsers = allUsers
      .filter((u) => !chattedUserIds.has(u._id))
      .map((u) => ({
        type: "user",
        key: u._id,
        userId: u._id,
        isGroup: false,
        name: u.name,
        avatarLetter: u.name?.[0],
        lastMessage: "Tap to start chat",
        unreadCount: 0,
      }));

    let combined = [...chatItems, ...noChatUsers];

    if (tab === "unread") combined = combined.filter((i) => i.unreadCount > 0);
    if (tab === "groups") combined = combined.filter((i) => i.isGroup);
    if (tab === "favourites") combined = []; // abhi koi favourites feature nahi

    return combined.sort((a, b) => {
      const aOnline = online.includes(a.userId);
      const bOnline = online.includes(b.userId);
      if (aOnline !== bOnline) return aOnline ? -1 : 1;
      return 0;
    });
  }, [chats, allUsers, online, user._id, tab]);

  const showingSearch = search.length > 0;
  const unreadTotal = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "2-digit" });
  };

  return (
    <>
      {/* LEFT ICON RAIL */}
      <div className="hidden sm:flex px-2 border-r-2 border-gray-800 bg-[#111416] flex-col items-center gap-1">
        <div className="w-11 h-11 flex items-center bg-[#00a8841f] justify-center rounded-3xl mt-1 cursor-pointer">
          <MaterialIcon path={ICON_CHAT} />
        </div>
        <div className="w-11 h-11 flex items-center justify-center rounded-3xl hover:bg-[#00a8841f] text-[#00a884] cursor-pointer">
          <MaterialIcon path={ICON_CALL} />
        </div>
        <div className="w-11 h-11 flex items-center justify-center rounded-3xl hover:bg-[#00a8841f] cursor-pointer">
          <MaterialIcon path={ICON_COMMUNITY} />
        </div>
        <div className="w-11 h-11 flex items-center justify-center rounded-3xl hover:bg-[#00a8841f] cursor-pointer">
          <MaterialIcon path={ICON_ARCHIVE} />
        </div>

        <div className="flex-1"></div>

        <div className="w-11 h-11 flex items-center justify-center rounded-3xl hover:bg-[#00a8841f] cursor-pointer">
          <Settings size={20} />
        </div>

        <div title={user?.name}>
          <img
            className="w-7 h-7 mb-4 rounded-full flex items-center justify-center bg-gradient-to-tr from-pink-500 to-purple-500 font-bold"
            src="https://img.freepik.com/free-photo/turned-gray-laptop-computer_400718-47.jpg?semt=ais_hybrid&w=740&q=80"
            alt=""
          />
        </div>
      </div>

      {/* CHAT LIST */}
      <div
        className={`${
          selectedChat ? "hidden sm:flex" : "flex"
        } w-full sm:w-[380px] bg-[#111416] flex-col px-3 py-1 border-r border-[#1e2428] min-h-0`}
      >
        <div className="flex justify-between p-1 items-center shrink-0">
          <h1 className="text-3xl">CHAT</h1>
          <div className="flex items-center justify-center">
            <div className="hover:bg-gray-800 px-2 py-2 rounded-full cursor-pointer">
              <MaterialIcon path={ICON_NEW_CHAT} size={18} />
            </div>
            <div className="relative">
              <div
                onClick={() => setMenuOpen((v) => !v)}
                className="hover:bg-gray-800 px-2 py-1.5 rounded-full cursor-pointer"
              >
                <MoreVertical size={18} color="#ffffff" />
              </div>
              {menuOpen && (
                <div
                  className="absolute right-0 top-10 w-44 bg-[#202427] border border-gray-800 rounded-xl shadow-xl py-1.5 z-20 overflow-hidden"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-gray-200 hover:bg-[#ffffff0d] transition"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 mb-3 shrink-0">
          <div className="relative w-full">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 opacity-70" />
            <input
              type="text"
              value={search}
              onChange={(e) => searchUsers(e.target.value)}
              placeholder="Search or start a new chat"
              className="w-full bg-[#202427] rounded-3xl pl-10 pr-4 py-3 text-gray-300 text-md focus:outline-none placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Tabs */}
        {!showingSearch && (
          <div className="flex gap-2 mb-3 shrink-0">
            <TabButton label="All" active={tab === "all"} onClick={() => setTab("all")} />
            <TabButton
              label="Unread"
              count={unreadTotal}
              active={tab === "unread"}
              onClick={() => setTab("unread")}
            />
            <TabButton
              label="Favourites"
              active={tab === "favourites"}
              onClick={() => setTab("favourites")}
            />
            <TabButton label="Groups" active={tab === "groups"} onClick={() => setTab("groups")} />
          </div>
        )}

        {/* Chats */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
          {showingSearch
            ? searchResults.map((u) => (
                <UserRow
                  key={u._id}
                  name={u.name}
                  subtitle={u.email}
                  avatarLetter={u.name[0]}
                  isOnline={online.includes(u._id)}
                  onClick={() => accessChat(u._id)}
                />
              ))
            : listItems.map((item) => (
                <UserRow
                  key={item.key}
                  name={item.name}
                  subtitle={item.lastMessage}
                  time={formatTime(item.lastMessageTime)}
                  avatarLetter={item.avatarLetter}
                  isOnline={online.includes(item.userId)}
                  active={selectedChat?._id === item.chat?._id}
                  unreadCount={item.unreadCount}
                  isOwnLastMessage={item.lastMessageSender === user._id}
                  onClick={() =>
                    item.type === "chat" ? setSelectedChat(item.chat) : accessChat(item.userId)
                  }
                />
              ))}

          {!showingSearch && listItems.length === 0 && <EmptyState text="No chats found" />}
          {showingSearch && searchResults.length === 0 && <EmptyState text="No users found" />}
        </div>
      </div>
    </>
  );
}

function TabButton({ label, count, active, onClick }) {
  return (
    <span
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded-full cursor-pointer ${
        active
          ? "bg-[#00a8841f] text-[#00a884]"
          : "text-gray-400 border hover:bg-[#00a8841f] hover:text-[#00a884] border-gray-800"
      }`}
    >
      {label}
      {!!count && <span className="ml-1">{count}</span>}
    </span>
  );
}

function UserRow({
  name,
  subtitle,
  time,
  avatarLetter,
  isOnline,
  active,
  unreadCount = 0,
  isOwnLastMessage,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 border-b-2 border-gray-900 hover:bg-[#ffffff05] rounded cursor-pointer ${
        active ? "bg-[#ffffff0d]" : ""
      }`}
    >
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-tr from-yellow-400 to-green-400 font-bold">
          {avatarLetter ? avatarLetter.toUpperCase() : <CircleUserRound size={22} className="text-gray-300" />}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00a884] border-2 border-[#111416]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="font-semibold truncate">{name}</p>
          {time && (
            <p className={`text-xs shrink-0 ml-2 ${unreadCount > 0 ? "text-[#00a884]" : "text-gray-400"}`}>
              {time}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center">
          <p
            className={`text-sm truncate flex items-center gap-1 ${
              isOnline ? "text-[#00a884]" : "text-gray-400"
            }`}
          >
            {isOwnLastMessage && !isOnline && (
              <CheckCheck size={15} className="text-gray-400 shrink-0" />
            )}
            {isOnline ? "online" : subtitle}
          </p>
          {unreadCount > 0 && (
            <span className="bg-[#00a884] text-black text-[11px] font-bold min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full shrink-0 ml-2">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center mt-16 gap-2 text-gray-500">
      <Search size={28} />
      <p className="text-sm">{text}</p>
    </div>
  );
}