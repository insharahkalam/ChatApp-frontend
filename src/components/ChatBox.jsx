// import { useEffect, useRef, useState } from "react";
// import API from "../services/api";
// import { useAuth } from "../context/AuthContext";
// import { useSocket } from "../context/SocketContext";
// import Message from "./Message";
// import TypingIndicator from "./TypingIndicator";

// export default function ChatBox({ selectedChat }) {
//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");
//   const [typing, setTyping] = useState(false);
//   const [othersTyping, setOthersTyping] = useState(false);
//   const { user } = useAuth();
//   const { socket, online } = useSocket();
//   const bottomRef = useRef();

//   // messages load + read mark
//   useEffect(() => {
//     if (!selectedChat || !socket) return;
//     (async () => {
//       const { data } = await API.get(`/messages/${selectedChat._id}`);
//       setMessages(data);
//       socket.emit("join-chat", selectedChat._id);

//       // 👇 chat open hote hi unread messages read mark karo
//       await API.put(`/messages/read/${selectedChat._id}`);
//       socket.emit("message-read", { chatId: selectedChat._id, userId: user._id });
//     })();
//   }, [selectedChat, socket]);

//   useEffect(() => {
//     if (!socket) return;

//     const handler = (msg) => {
//       if (msg.chat._id !== selectedChat?._id) return;
//       setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));

//       // agar chat abhi open hai, to naya message aate hi read mark karo
//       API.put(`/messages/read/${selectedChat._id}`);
//       socket.emit("message-read", { chatId: selectedChat._id, userId: user._id });
//     };

//     // 👇 NEW — jab doosra user hamare messages read kare, ticks update karo
//     const seenHandler = ({ chatId, userId }) => {
//       if (chatId !== selectedChat?._id) return;
//       setMessages((prev) =>
//         prev.map((m) =>
//           m.readBy?.includes(userId) ? m : { ...m, readBy: [...(m.readBy || []), userId] }
//         )
//       );
//     };

//     socket.on("message-received", handler);
//     socket.on("messages-seen", seenHandler);
//     socket.on("typing", () => setOthersTyping(true));
//     socket.on("stop-typing", () => setOthersTyping(false));

//     return () => {
//       socket.off("message-received", handler);
//       socket.off("messages-seen", seenHandler);
//       socket.off("typing");
//       socket.off("stop-typing");
//     };
//   }, [socket, selectedChat]);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, othersTyping]);

//   const send = async () => {
//     if (!text.trim() || !socket) return;
//     socket.emit("stop-typing", selectedChat._id);
//     const { data } = await API.post("/messages", { content: text, chatId: selectedChat._id });
//     socket.emit("new-message", data);
//     setMessages((prev) => [...prev, data]);
//     setText("");
//   };

//   const handleTyping = (e) => {
//     setText(e.target.value);
//     if (!socket) return;
//     if (!typing) {
//       setTyping(true);
//       socket.emit("typing", selectedChat._id);
//     }
//     clearTimeout(window._t);
//     window._t = setTimeout(() => {
//       socket.emit("stop-typing", selectedChat._id);
//       setTyping(false);
//     }, 1500);
//   };

//   if (!selectedChat)
//     return (
//       <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] text-gray-400">
//         <div className="text-6xl mb-4">💬</div>
//         <p className="text-lg">Select a chat to start messaging</p>
//       </div>
//     );

//   const other = selectedChat.users.find((u) => u._id !== user._id);
//   const isOnline = online.includes(other?._id);

//   return (
//     <div className="flex-1 flex flex-col h-screen">
//       <div className="p-3 bg-[#075E54] text-white flex items-center gap-3 shadow-sm shrink-0">
//         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center font-bold">
//           {selectedChat.isGroupChat ? "G" : other?.name?.[0]}
//         </div>
//         <div>
//           <h3 className="font-semibold text-[15px] leading-tight">
//             {selectedChat.isGroupChat ? selectedChat.chatName : other?.name}
//           </h3>
//           <p className="text-xs text-white/70">
//             {selectedChat.isGroupChat ? "" : isOnline ? "online" : "offline"}
//           </p>
//         </div>
//       </div>

//       <div
//         className="flex-1 overflow-y-auto p-4 space-y-1"
//         style={{
//           backgroundColor: "#e5ddd5",
//           backgroundImage:
//             "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d1c9bd' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
//         }}
//       >
//         {messages.map((m) => (
//           <Message
//             key={m._id}
//             msg={m}
//             isOwn={m.sender._id === user._id}
//             isRead={other && m.readBy?.includes(other._id)}
//           />
//         ))}
//         {othersTyping && <TypingIndicator />}
//         <div ref={bottomRef} />
//       </div>

//       <div className="p-3 bg-[#f0f2f5] flex items-center gap-2 shrink-0">
//         <input
//           value={text}
//           onChange={handleTyping}
//           onKeyDown={(e) => e.key === "Enter" && send()}
//           placeholder="Type a message"
//           className="flex-1 border-none rounded-full px-4 py-2.5 outline-none bg-white shadow-sm text-[15px]"
//         />
//         <button
//           onClick={send}
//           disabled={!text.trim()}
//           className="w-11 h-11 shrink-0 flex items-center justify-center bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-40 text-white rounded-full transition"
//         >
//           ➤
//         </button>
//       </div>
//     </div>
//   );
// }



import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";

export default function ChatBox({ selectedChat }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [othersTyping, setOthersTyping] = useState(false);
  const { user } = useAuth();
  const { socket, online } = useSocket();
  const bottomRef = useRef();

  // messages load + read mark
  useEffect(() => {
    if (!selectedChat || !socket) return;
    (async () => {
      const { data } = await API.get(`/messages/${selectedChat._id}`);
      setMessages(data);
      socket.emit("join-chat", selectedChat._id);

      await API.put(`/messages/read/${selectedChat._id}`);
      socket.emit("message-read", { chatId: selectedChat._id, userId: user._id });
    })();
  }, [selectedChat, socket]);

  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      if (msg.chat._id !== selectedChat?._id) return;
      setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));

      API.put(`/messages/read/${selectedChat._id}`);
      socket.emit("message-read", { chatId: selectedChat._id, userId: user._id });
    };

    const seenHandler = ({ chatId, userId }) => {
      if (chatId !== selectedChat?._id) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.readBy?.includes(userId) ? m : { ...m, readBy: [...(m.readBy || []), userId] }
        )
      );
    };

    socket.on("message-received", handler);
    socket.on("messages-seen", seenHandler);
    socket.on("typing", () => setOthersTyping(true));
    socket.on("stop-typing", () => setOthersTyping(false));

    return () => {
      socket.off("message-received", handler);
      socket.off("messages-seen", seenHandler);
      socket.off("typing");
      socket.off("stop-typing");
    };
  }, [socket, selectedChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, othersTyping]);

  const send = async () => {
    if (!text.trim() || !socket) return;
    socket.emit("stop-typing", selectedChat._id);
    const { data } = await API.post("/messages", { content: text, chatId: selectedChat._id });
    socket.emit("new-message", data);
    setMessages((prev) => [...prev, data]);
    setText("");
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    clearTimeout(window._t);
    window._t = setTimeout(() => {
      socket.emit("stop-typing", selectedChat._id);
      setTyping(false);
    }, 1500);
  };

  if (!selectedChat)
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#222e35] text-[#8696a0]">
        <div className="text-7xl mb-6 opacity-50">💬</div>
        <p className="text-lg font-light">Select a chat to start messaging</p>
      </div>
    );

  const other = selectedChat.users.find((u) => u._id !== user._id);
  const isOnline = online.includes(other?._id);

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0b141a]">
      {/* Header */}
      <div className="px-4 py-2.5 bg-[#202c33] text-[#e9edef] flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00a884] to-[#008069] flex items-center justify-center font-bold">
            {selectedChat.isGroupChat ? "G" : other?.name?.[0]}
          </div>
          <div>
            <h3 className="font-medium text-[15px] leading-tight">
              {selectedChat.isGroupChat ? selectedChat.chatName : other?.name}
            </h3>
            <p className="text-xs text-[#8696a0]">
              {selectedChat.isGroupChat ? "" : isOnline ? "online" : "offline"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5 text-[#aebac1] text-lg">
          <button className="hover:text-white transition">📹</button>
          <button className="hover:text-white transition">📞</button>
          <button className="hover:text-white transition">🔍</button>
          <button className="hover:text-white transition">⋮</button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-1"
        style={{
          backgroundColor: "#0b141a",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182229' fill-opacity='0.6'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      >
        {messages.map((m) => (
          <Message
            key={m._id}
            msg={m}
            isOwn={m.sender._id === user._id}
            isRead={other && m.readBy?.includes(other._id)}
          />
        ))}
        {othersTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-2.5 bg-[#202c33] flex items-center gap-3 shrink-0">
        <button className="text-[#8696a0] hover:text-white text-xl transition">😊</button>
        <button className="text-[#8696a0] hover:text-white text-xl transition rotate-45">📎</button>
        <input
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message"
          className="flex-1 border-none rounded-lg px-4 py-2.5 outline-none bg-[#2a3942] text-[#e9edef] placeholder:text-[#8696a0] text-[15px]"
        />
        <button
          onClick={send}
          disabled={!text.trim()}
          className="w-10 h-10 shrink-0 flex items-center justify-center bg-transparent disabled:opacity-40 text-[#8696a0] hover:text-white text-xl transition"
        >
          {text.trim() ? "➤" : "🎤"}
        </button>
      </div>
    </div>
  );
}