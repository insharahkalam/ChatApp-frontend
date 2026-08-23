// // import { useEffect, useState } from "react";
// // import API from "../services/api";
// // import { useAuth } from "../context/AuthContext";
// // import { useSocket } from "../context/SocketContext";

// // export default function Sidebar({ selectedChat, setSelectedChat }) {
// //   const [chats, setChats] = useState([]);
// //   const [users, setUsers] = useState([]);
// //   const [search, setSearch] = useState("");
// //   const { user, logout } = useAuth();
// //   const { online } = useSocket();

// //   const loadChats = async () => {
// //     const { data } = await API.get("/chats");
// //     setChats(data);
// //   };

// //   useEffect(() => { loadChats(); }, []);

// //   const searchUsers = async (q) => {
// //     setSearch(q);
// //     if (!q) return setUsers([]);
// //     const { data } = await API.get(`/auth/users?search=${q}`);
// //     setUsers(data);
// //   };

// //   const accessChat = async (userId) => {
// //     const { data } = await API.post("/chats", { userId });
// //     setUsers([]); setSearch("");
// //     if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
// //     setSelectedChat(data);
// //   };

// //   return (
// //     <div className="w-80 bg-white border-r flex flex-col">
// //       <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
// //         <h2 className="font-bold text-lg">💬 {user?.name}</h2>
// //         <button onClick={logout} className="text-sm bg-white/20 px-3 py-1 rounded">Logout</button>
// //       </div>
// //       <input value={search} onChange={(e) => searchUsers(e.target.value)}
// //         placeholder="Search users..." className="m-3 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
// //       <div className="flex-1 overflow-y-auto">
// //         {users.length > 0 ? users.map((u) => (
// //           <div key={u._id} onClick={() => accessChat(u._id)}
// //             className="p-3 hover:bg-indigo-50 cursor-pointer border-b flex items-center gap-3">
// //             <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
// //               {u.name[0]}
// //             </div>
// //             <div>
// //               <p className="font-semibold">{u.name}</p>
// //               <p className="text-xs text-gray-500">{u.email}</p>
// //             </div>
// //           </div>
// //         )) : chats.map((c) => {
// //           const other = c.users.find((x) => x._id !== user._id);
// //           const isOnline = online.includes(other?._id);
// //           return (
// //             <div key={c._id} onClick={() => setSelectedChat(c)}
// //               className={`p-3 cursor-pointer border-b flex items-center gap-3 ${selectedChat?._id === c._id ? "bg-indigo-100" : "hover:bg-gray-50"}`}>
// //               <div className="relative">
// //                 <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
// //                   {c.isGroupChat ? "G" : other?.name[0]}
// //                 </div>
// //                 {!c.isGroupChat && (
// //                   <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-gray-400"}`}></span>
// //                 )}
// //               </div>
// //               <div className="flex-1">
// //                 <p className="font-semibold">{c.isGroupChat ? c.chatName : other?.name}</p>
// //                 <p className="text-xs text-gray-500 truncate">{c.latestMessage?.content || "No messages yet"}</p>
// //               </div>
// //             </div>
// //           );
// //         })}
// //       </div>
// //     </div>
// //   );
// // }



// import { useEffect, useMemo, useState } from "react";
// import API from "../services/api";
// import { useAuth } from "../context/AuthContext";
// import { useSocket } from "../context/SocketContext";

// export default function Sidebar({ selectedChat, setSelectedChat }) {
//   const [chats, setChats] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [searchResults, setSearchResults] = useState([]);
//   const [search, setSearch] = useState("");
//   const { user, logout } = useAuth();
//   const { online, socket } = useSocket(); // array of online userIds

//   const loadChats = async () => {
//     const { data } = await API.get("/chats");
//     setChats(data);
//   };

//   const loadAllUsers = async () => {
//     // backend route: return all users except current user
//     const { data } = await API.get("/auth/users");
//     setAllUsers(data.filter((u) => u._id !== user._id));
//   };

//   useEffect(() => {
//     loadChats();
//     loadAllUsers();
//   }, []);

//   useEffect(() => {
//     if (!socket) return;
//     const handler = (msg) => {
//       setChats((prev) => {
//         const exists = prev.find((c) => c._id === msg.chat._id);
//         if (!exists) {
//           loadChats();
//           return prev;
//         }
//         const isCurrentlyOpen = selectedChat?._id === msg.chat._id; // 👈 check
//         const updated = prev.map((c) =>
//           c._id === msg.chat._id
//             ? {
//               ...c,
//               latestMessage: msg,
//               unreadCount: isCurrentlyOpen ? 0 : (c.unreadCount || 0) + 1, // 👈 fix
//             }
//             : c
//         );
//         return [...updated].sort((a, b) =>
//           a._id === msg.chat._id ? -1 : b._id === msg.chat._id ? 1 : 0
//         );
//       });
//     };
//     socket.on("message-received", handler);
//     return () => socket.off("message-received", handler);
//   }, [socket, selectedChat]); // 👈 selectedChat dependency me add karo

//   const searchUsers = async (q) => {
//     setSearch(q);
//     if (!q) return setSearchResults([]);
//     const { data } = await API.get(`/auth/users?search=${q}`);
//     setSearchResults(data.filter((u) => u._id !== user._id));
//   };

//   const accessChat = async (userId) => {
//     const { data } = await API.post("/chats", { userId });
//     setSearchResults([]);
//     setSearch("");
//     setChats((prev) => (prev.find((c) => c._id === data._id) ? prev : [data, ...prev]));
//     setSelectedChat(data);
//   };

//   // merge: users with existing chats (as chat objects) + users without chats yet
//   const listItems = useMemo(() => {
//     const chattedUserIds = new Set(
//       chats.map((c) => c.users.find((x) => x._id !== user._id)?._id).filter(Boolean)
//     );

//     const chatItems = chats.map((c) => {
//       const other = c.users.find((x) => x._id !== user._id);
//       return {
//         type: "chat",
//         key: c._id,
//         chat: c,
//         userId: other?._id,
//         name: c.isGroupChat ? c.chatName : other?.name,
//         avatarLetter: c.isGroupChat ? "G" : other?.name?.[0],
//         lastMessage: c.latestMessage?.content || "No messages yet",
//         lastMessageTime: c.latestMessage?.createdAt,
//         unreadCount: c.unreadCount || 0,
//       };
//     });

//     const noChatUsers = allUsers
//       .filter((u) => !chattedUserIds.has(u._id))
//       .map((u) => ({
//         type: "user",
//         key: u._id,
//         userId: u._id,
//         name: u.name,
//         avatarLetter: u.name?.[0],
//         lastMessage: "Tap to start chat",
//       }));

//     const combined = [...chatItems, ...noChatUsers];

//     // online users pehle, phir alphabetical/last-message-time
//     return combined.sort((a, b) => {
//       const aOnline = online.includes(a.userId);
//       const bOnline = online.includes(b.userId);
//       if (aOnline !== bOnline) return aOnline ? -1 : 1;
//       return 0;
//     });
//   }, [chats, allUsers, online, user._id]);

//   const showingSearch = search.length > 0;

//   return (
//     <div className="w-80 h-screen bg-white flex flex-col border-r">
//       {/* Header - WhatsApp green */}
//       <div className="p-4 bg-[#075E54] text-white flex justify-between items-center shrink-0">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
//             {user?.name?.[0]}
//           </div>
//           <h2 className="font-semibold text-base">{user?.name}</h2>
//         </div>
//         <button
//           onClick={logout}
//           className="text-xs bg-white/15 hover:bg-white/25 transition px-3 py-1.5 rounded-full"
//         >
//           Logout
//         </button>
//       </div>

//       {/* Search bar */}
//       <div className="p-2 bg-[#f0f2f5] shrink-0">
//         <div className="flex items-center bg-white rounded-lg px-3 py-2 gap-2 shadow-sm">
//           <span className="text-gray-400">🔍</span>
//           <input
//             value={search}
//             onChange={(e) => searchUsers(e.target.value)}
//             placeholder="Search or start new chat"
//             className="flex-1 outline-none text-sm bg-transparent"
//           />
//         </div>
//       </div>

//       {/* List */}
//       <div className="flex-1 overflow-y-auto">
//         {showingSearch
//           ? searchResults.map((u) => (
//             <UserRow
//               key={u._id}
//               name={u.name}
//               subtitle={u.email}
//               avatarLetter={u.name[0]}
//               isOnline={online.includes(u._id)}
//               onClick={() => accessChat(u._id)}
//             />
//           ))
//           : listItems.map((item) => (
//             <UserRow
//               key={item.key}
//               name={item.name}
//               subtitle={item.lastMessage}
//               avatarLetter={item.avatarLetter}
//               isOnline={online.includes(item.userId)}
//               active={selectedChat?._id === item.chat?._id}
//               unreadCount={item.unreadCount}
//               onClick={() =>
//                 item.type === "chat" ? setSelectedChat(item.chat) : accessChat(item.userId)
//               }
//             />
//           ))}

//         {!showingSearch && listItems.length === 0 && (
//           <p className="text-center text-gray-400 text-sm mt-6">No users found</p>
//         )}
//       </div>
//     </div>
//   );
// }

// function UserRow({ name, subtitle, avatarLetter, isOnline, active, unreadCount = 0, onClick }) {
//   return (
//     <div
//       onClick={onClick}
//       className={`px-3 py-3 cursor-pointer flex items-center gap-3 border-b border-gray-100 transition ${active ? "bg-[#f0f2f5]" : "hover:bg-gray-50"
//         }`}
//     >
//       <div className="relative shrink-0">
//         <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white flex items-center justify-center font-bold text-lg">
//           {avatarLetter}
//         </div>
//         {isOnline && (
//           <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#25D366] border-2 border-white"></span>
//         )}
//       </div>
//       <div className="flex-1 min-w-0">
//         <p className={`text-[15px] truncate ${unreadCount > 0 ? "font-bold text-gray-900" : "font-medium text-gray-900"}`}>
//           {name}
//         </p>
//         <p className={`text-[13px] truncate ${isOnline ? "text-[#25D366]" : unreadCount > 0 ? "text-gray-800 font-medium" : "text-gray-500"}`}>
//           {isOnline ? "Online" : subtitle}
//         </p>
//       </div>
//       {unreadCount > 0 && (
//         <span className="bg-[#25D366] text-white text-[11px] font-bold min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full">
//           {unreadCount > 9 ? "9+" : unreadCount}
//         </span>
//       )}
//     </div>
//   );
// }



import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function Sidebar({ selectedChat, setSelectedChat }) {
  const [chats, setChats] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all"); // all | unread | groups
  const { user, logout } = useAuth();
  const { online, socket } = useSocket(); // array of online userIds

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

  // merge: users with existing chats (as chat objects) + users without chats yet
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

    return combined.sort((a, b) => {
      const aOnline = online.includes(a.userId);
      const bOnline = online.includes(b.userId);
      if (aOnline !== bOnline) return aOnline ? -1 : 1;
      return 0;
    });
  }, [chats, allUsers, online, user._id, tab]);

  const showingSearch = search.length > 0;
  const unreadTotal = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const groupsTotal = chats.filter((c) => c.isGroupChat).length;

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="w-[380px] h-screen bg-[#111b21] flex flex-col border-r border-black/40">
      {/* Header */}
      <div className="px-4 py-3 bg-[#202c33] flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00a884] to-[#008069] flex items-center justify-center font-bold text-white">
            {user?.name?.[0]}
          </div>
          <h2 className="font-medium text-[#e9edef] text-base">{user?.name}</h2>
        </div>
        <button
          onClick={logout}
          className="text-xs text-[#aebac1] hover:text-white hover:bg-white/10 transition px-3 py-1.5 rounded-full"
        >
          Logout
        </button>
      </div>

      {/* Search bar */}
      <div className="px-3 py-2 bg-[#111b21] shrink-0">
        <div className="flex items-center bg-[#202c33] rounded-lg px-3 py-[7px] gap-3">
          <span className="text-[#8696a0] text-sm">🔍</span>
          <input
            value={search}
            onChange={(e) => searchUsers(e.target.value)}
            placeholder="Search or start new chat"
            className="flex-1 outline-none text-sm bg-transparent text-[#e9edef] placeholder:text-[#8696a0]"
          />
        </div>
      </div>

      {/* Tabs */}
      {!showingSearch && (
        <div className="px-3 pb-2 flex gap-2 shrink-0">
          <TabButton label="All" active={tab === "all"} onClick={() => setTab("all")} />
          <TabButton
            label="Unread"
            count={unreadTotal}
            active={tab === "unread"}
            onClick={() => setTab("unread")}
          />
          <TabButton
            label="Groups"
            count={groupsTotal}
            active={tab === "groups"}
            onClick={() => setTab("groups")}
          />
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
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
              onClick={() =>
                item.type === "chat" ? setSelectedChat(item.chat) : accessChat(item.userId)
              }
            />
          ))}

        {!showingSearch && listItems.length === 0 && (
          <p className="text-center text-[#8696a0] text-sm mt-6">No chats found</p>
        )}
        {showingSearch && searchResults.length === 0 && (
          <p className="text-center text-[#8696a0] text-sm mt-6">No users found</p>
        )}
      </div>
    </div>
  );
}

function TabButton({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition flex items-center gap-1.5 ${active
          ? "bg-[#00a884] text-[#0b141a]"
          : "bg-[#202c33] text-[#e9edef] hover:bg-[#2a3942]"
        }`}
    >
      {label}
      {!!count && (
        <span
          className={`text-[11px] ${active ? "text-[#0b141a]/70" : "text-[#8696a0]"}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function UserRow({ name, subtitle, time, avatarLetter, isOnline, active, unreadCount = 0, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 cursor-pointer flex items-center gap-3 border-b border-white/5 transition ${active ? "bg-[#2a3942]" : "hover:bg-[#202c33]"
        }`}
    >
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00a884] to-[#008069] text-white flex items-center justify-center font-bold text-lg">
          {avatarLetter}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#00a884] border-2 border-[#111b21]"></span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <p
            className={`text-[15px] truncate ${unreadCount > 0 ? "font-semibold text-[#e9edef]" : "font-normal text-[#e9edef]"
              }`}
          >
            {name}
          </p>
          {time && (
            <span
              className={`text-[11px] shrink-0 ml-2 ${unreadCount > 0 ? "text-[#00a884] font-semibold" : "text-[#8696a0]"
                }`}
            >
              {time}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <p
            className={`text-[13px] truncate ${isOnline ? "text-[#00a884]" : unreadCount > 0 ? "text-[#e9edef]" : "text-[#8696a0]"
              }`}
          >
            {isOnline ? "online" : subtitle}
          </p>
          {unreadCount > 0 && (
            <span className="bg-[#00a884] text-[#0b141a] text-[11px] font-bold min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full shrink-0 ml-2">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}