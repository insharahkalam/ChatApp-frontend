import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";
import EmojiPicker from "./EmojiPicker";
import {
  Paperclip,
  Mic,
  Send,
  Video,
  Phone,
  Search,
  MoreVertical,
  MessageCircle,
  Smile,
  Plus,
  Camera,
  X,
} from "lucide-react";

export default function ChatBox({ selectedChat }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [othersTyping, setOthersTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { user } = useAuth();
  const { socket, online } = useSocket();
  const bottomRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    if (!selectedChat || !socket) return;
    (async () => {
      const { data } = await API.get(`/messages/${selectedChat._id}`);
      setMessages(data);
      socket.emit("join-chat", selectedChat._id);
      await API.put(`/messages/read/${selectedChat._id}`);
      socket.emit("message-read", { chatId: selectedChat._id, userId: user._id });
    })();
    setReplyingTo(null);
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

    const deletedHandler = ({ chatId, messageId }) => {
      if (chatId !== selectedChat?._id) return;
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    const editedHandler = ({ chatId, messageId, content }) => {
      if (chatId !== selectedChat?._id) return;
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, content, edited: true } : m))
      );
    };

    const reactedHandler = ({ chatId, messageId, emoji, userId }) => {
      if (chatId !== selectedChat?._id) return;
      setMessages((prev) =>
        prev.map((m) => {
          if (m._id !== messageId) return m;
          const reactions = { ...(m.reactions || {}) };
          if (reactions[userId] === emoji) delete reactions[userId];
          else reactions[userId] = emoji;
          return { ...m, reactions };
        })
      );
    };

    socket.on("message-received", handler);
    socket.on("messages-seen", seenHandler);
    socket.on("message-deleted", deletedHandler);
    socket.on("message-edited", editedHandler);
    socket.on("message-reacted", reactedHandler);
    socket.on("typing", () => setOthersTyping(true));
    socket.on("stop-typing", () => setOthersTyping(false));

    return () => {
      socket.off("message-received", handler);
      socket.off("messages-seen", seenHandler);
      socket.off("message-deleted", deletedHandler);
      socket.off("message-edited", editedHandler);
      socket.off("message-reacted", reactedHandler);
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
    const payload = {
      content: text,
      chatId: selectedChat._id,
      replyTo: replyingTo?._id || null,
    };
    const { data } = await API.post("/messages", payload);
    socket.emit("new-message", data);
    setMessages((prev) => [...prev, data]);
    setText("");
    setReplyingTo(null);
    setShowEmojiPicker(false);
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

  const handleDelete = async (messageId) => {
    try {
      await API.delete(`/messages/${messageId}`);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      socket?.emit("delete-message", { chatId: selectedChat._id, messageId });
    } catch (err) {
      alert(err.response?.data?.msg || "Could not delete message");
    }
  };

  const handleEdit = async (messageId, newContent) => {
    try {
      const { data } = await API.put(`/messages/${messageId}`, { content: newContent });
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, content: data.content, edited: true } : m))
      );
      socket?.emit("edit-message", { chatId: selectedChat._id, messageId, content: newContent });
    } catch (err) {
      alert(err.response?.data?.msg || "Could not edit message");
    }
  };

  const handleReact = async (messageId, emoji) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m._id !== messageId) return m;
        const reactions = { ...(m.reactions || {}) };
        if (reactions[user._id] === emoji) delete reactions[user._id];
        else reactions[user._id] = emoji;
        return { ...m, reactions };
      })
    );
    try {
      await API.put(`/messages/react/${messageId}`, { emoji });
      socket?.emit("react-message", { chatId: selectedChat._id, messageId, emoji, userId: user._id });
    } catch (err) {
      // silent fail ok for reactions
    }
  };

  const onEmojiSelect = (emoji) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  if (!selectedChat)
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#222e35] text-[#8696a0]">
        <MessageCircle size={80} strokeWidth={1} className="mb-6 opacity-40" />
        <p className="text-lg font-light">Select a chat to start messaging</p>
      </div>
    );

  const other = selectedChat.users.find((u) => u._id !== user._id);
  const isOnline = online.includes(other?._id);

  const findMessageById = (id) => messages.find((m) => m._id === id);

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0b141a] relative">
      {/* Header */}
      <div className="px-4 py-2.5 bg-[#202c33] text-[#e9edef] flex items-center justify-between shadow-sm shrink-0 z-10">
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
        <div className="flex items-center gap-4 text-[#aebac1]">
          <button className="hover:text-white transition p-1"><Video size={20} /></button>
          <button className="hover:text-white transition p-1"><Phone size={19} /></button>
          <button className="hover:text-white transition p-1"><Search size={19} /></button>
          <button className="hover:text-white transition p-1"><MoreVertical size={20} /></button>
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
            currentUserId={user._id}
            repliedMessage={m.replyTo ? findMessageById(m.replyTo) || m.replyToSnapshot : null}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onReact={handleReact}
            onReply={setReplyingTo}
          />
        ))}
        {othersTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Reply preview bar */}
      {replyingTo && (
        <div className="px-4 pt-2 bg-[#202c33] shrink-0">
          <div className="flex items-stretch bg-[#2a2f32] rounded-lg overflow-hidden">
            <div className="w-1 bg-[#00a884] shrink-0" />
            <div className="flex-1 py-2 px-3 min-w-0">
              <p className="text-[13px] font-medium text-[#00a884]">
                {replyingTo.sender?._id === user._id ? "You" : replyingTo.sender?.name}
              </p>
              <p className="text-[13px] text-[#8696a0] truncate">{replyingTo.content}</p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="px-3 flex items-center text-[#8696a0] hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Emoji picker */}
      {showEmojiPicker && (
        <EmojiPicker onSelect={onEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
      )}

      {/* Input */}
      <div className="px-4 py-2.5 bg-[#202c33] flex items-center gap-3 shrink-0 relative">
        <button
          onClick={() => setShowEmojiPicker((v) => !v)}
          className={`transition ${showEmojiPicker ? "text-[#00a884]" : "text-[#8696a0] hover:text-white"}`}
        >
          <Smile size={24} />
        </button>
        <button className="text-[#8696a0] hover:text-white transition">
          <Plus size={22} />
        </button>
        <input
          ref={inputRef}
          value={text}
          onChange={handleTyping}
          onFocus={() => setShowEmojiPicker(false)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message"
          className="flex-1 border-none rounded-lg px-4 py-2.5 outline-none bg-[#2a3942] text-[#e9edef] placeholder:text-[#8696a0] text-[15px]"
        />
        {!text.trim() && (
          <button className="text-[#8696a0] hover:text-white transition">
            <Camera size={22} />
          </button>
        )}
        <button
          onClick={text.trim() ? send : undefined}
          className="w-10 h-10 shrink-0 flex items-center justify-center bg-transparent text-[#8696a0] hover:text-white transition"
        >
          {text.trim() ? <Send size={22} /> : <Mic size={22} />}
        </button>
      </div>
    </div>
  );
}