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
  const { socket } = useSocket();
  const bottomRef = useRef();

  useEffect(() => {
    if (!selectedChat) return;
    (async () => {
      const { data } = await API.get(`/messages/${selectedChat._id}`);
      setMessages(data);
      socket?.emit("join-chat", selectedChat._id);
    })();
  }, [selectedChat, socket]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (msg.chat._id === selectedChat?._id) setMessages((m) => [...m, msg]);
    };
    socket.on("message-received", handler);
    socket.on("typing", () => setOthersTyping(true));
    socket.on("stop-typing", () => setOthersTyping(false));
    return () => { socket.off("message-received", handler); socket.off("typing"); socket.off("stop-typing"); };
  }, [socket, selectedChat]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, othersTyping]);

  const send = async () => {
    if (!text.trim()) return;
    socket.emit("stop-typing", selectedChat._id);
    const { data } = await API.post("/messages", { content: text, chatId: selectedChat._id });
    socket.emit("new-message", data);
    setMessages([...messages, data]);
    setText("");
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket) return;
    if (!typing) { setTyping(true); socket.emit("typing", selectedChat._id); }
    clearTimeout(window._t);
    window._t = setTimeout(() => { socket.emit("stop-typing", selectedChat._id); setTyping(false); }, 1500);
  };

  if (!selectedChat)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-xl">
        👈 Select a chat to start messaging
      </div>
    );

  const other = selectedChat.users.find((u) => u._id !== user._id);

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 bg-white border-b shadow-sm">
        <h3 className="font-bold text-lg">{selectedChat.isGroupChat ? selectedChat.chatName : other?.name}</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-gray-100">
        {messages.map((m) => <Message key={m._id} msg={m} isOwn={m.sender._id === user._id} />)}
        {othersTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 bg-white border-t flex gap-2">
        <input value={text} onChange={handleTyping} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
        <button onClick={send} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-full font-semibold">
          Send
        </button>
      </div>
    </div>
  );
}
