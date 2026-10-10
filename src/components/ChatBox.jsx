import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";
import EmojiPicker from "./EmojiPicker";
import {
  Paperclip, Mic, Send, Video, Phone, Search, MoreVertical, Smile,
  Camera, X, Timer, Check, ArrowLeft, Lock, MessageCircle,
} from "lucide-react";

const DISAPPEAR_OPTIONS = [
  { label: "Off", seconds: 0 },
  { label: "24 hours", seconds: 86400 },
  { label: "7 days", seconds: 7 * 86400 },
  { label: "90 days", seconds: 90 * 86400 },
];

export default function ChatBox({ selectedChat, setSelectedChat }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [othersTyping, setOthersTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [disappearSubmenuOpen, setDisappearSubmenuOpen] = useState(false);
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
    setHeaderMenuOpen(false);
    setDisappearSubmenuOpen(false);
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

    // jab dusra user disappearing setting change kare, sync ho jaye
    const disappearingChangedHandler = ({ chatId, duration }) => {
      if (chatId !== selectedChat?._id) return;
      setSelectedChat((prev) =>
        prev && prev._id === chatId ? { ...prev, disappearingDuration: duration } : prev
      );
    };

    socket.on("message-received", handler);
    socket.on("messages-seen", seenHandler);
    socket.on("message-deleted", deletedHandler);
    socket.on("message-edited", editedHandler);
    socket.on("message-reacted", reactedHandler);
    socket.on("disappearing-changed", disappearingChangedHandler);
    socket.on("typing", () => setOthersTyping(true));
    socket.on("stop-typing", () => setOthersTyping(false));

    return () => {
      socket.off("message-received", handler);
      socket.off("messages-seen", seenHandler);
      socket.off("message-deleted", deletedHandler);
      socket.off("message-edited", editedHandler);
      socket.off("message-reacted", reactedHandler);
      socket.off("disappearing-changed", disappearingChangedHandler);
      socket.off("typing");
      socket.off("stop-typing");
    };
  }, [socket, selectedChat, setSelectedChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, othersTyping]);

  // har second check karo koi message expire to nahi ho gaya, UI se hata do
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prev) => {
        const now = Date.now();
        const filtered = prev.filter(
          (m) => !m.expiresAt || new Date(m.expiresAt).getTime() > now
        );
        return filtered.length !== prev.length ? filtered : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
    } catch (err) { }
  };

  // disappearing messages duration set karo is chat ke liye
  const handleSetDisappearing = async (seconds) => {
    try {
      await API.put(`/chats/disappearing/${selectedChat._id}`, {
        duration: seconds,
      });
      setSelectedChat((prev) => (prev ? { ...prev, disappearingDuration: seconds } : prev));
      socket?.emit("disappearing-changed", { chatId: selectedChat._id, duration: seconds });
      setDisappearSubmenuOpen(false);
      setHeaderMenuOpen(false);
    } catch (err) {
      alert(err.response?.data?.msg || "Could not update setting");
    }
  };

  const onEmojiSelect = (emoji) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  /* ---------- DEFAULT WELCOME VIEW ---------- */
  if (!selectedChat)
    return (
      <div className="flex-1 bg-[#0f1316] hidden sm:flex flex-col">
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <div className="text-center max-w-lg">
            <div className="mb-6">
              <MessageCircle size={64} className="text-[#00A884] opacity-40 mx-auto" />
            </div>
            <h1 className="text-3xl font-semibold text-white mb-2">WhatsApp for Windows</h1>
            <p className="text-sm mb-6 leading-relaxed">
              Send and receive messages without keeping your phone online.
              <br />
              Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs">
              <Lock size={13} className="text-gray-400" />
              <span>Your personal messages are end-to-end encrypted</span>
            </div>
          </div>
        </div>
      </div>
    );

  const other = selectedChat.users.find((u) => u._id !== user._id);
  const isOnline = online.includes(other?._id);
  const disappearingOn = (selectedChat.disappearingDuration || 0) > 0;

  const findMessageById = (id) => messages.find((m) => m._id === id);

  const currentDisappearLabel =
    DISAPPEAR_OPTIONS.find((o) => o.seconds === (selectedChat.disappearingDuration || 0))
      ?.label || "Off";

  const headerBtn = "p-2 rounded-full hover:bg-gray-800/40";

  return (
    <div className="flex-1 min-w-0 bg-[#0f1316] flex flex-col h-full text-gray-100 relative">
      {/* Top bar */}
      <header className="flex items-center gap-4 px-5 py-3 border-b border-gray-800 bg-black/30 backdrop-blur-sm shrink-0 z-10">
        <button
          className="sm:hidden p-2 -ml-2 rounded-full hover:bg-gray-800/40"
          onClick={() => setSelectedChat(null)}
          title="Back"
        >
          <ArrowLeft size={19} className="text-gray-300" />
        </button>

        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-tr from-pink-500 to-purple-500 font-bold">
          {selectedChat.isGroupChat ? "G" : other?.name?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">
            {selectedChat.isGroupChat ? selectedChat.chatName : other?.name}
          </div>
          <div className="text-xs text-gray-400 truncate flex items-center gap-1">
            {disappearingOn && <Timer size={13} />}
            {disappearingOn
              ? `Disappearing messages: ${currentDisappearLabel}`
              : selectedChat.isGroupChat
                ? ""
                : isOnline
                  ? "online"
                  : "offline"}
          </div>
        </div>

        {/* right icons */}
        <div className="ml-auto flex items-center gap-2">
          <button className={headerBtn} title="Video">
            <Video size={19} className="text-gray-300" />
          </button>
          <button className={headerBtn} title="Call">
            <Phone size={18} className="text-gray-300" />
          </button>
          <button className={headerBtn} title="Search">
            <Search size={18} className="text-gray-300" />
          </button>

          {/* 3-dot menu with Disappearing Messages option */}
          <div className="relative">
            <button
              className={headerBtn}
              title="More"
              onClick={() => {
                setHeaderMenuOpen((v) => !v);
                setDisappearSubmenuOpen(false);
              }}
            >
              <MoreVertical size={19} className="text-gray-300" />
            </button>

            {headerMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => {
                    setHeaderMenuOpen(false);
                    setDisappearSubmenuOpen(false);
                  }}
                />
                <div className="absolute right-0 top-11 w-56 bg-[#202427] border border-gray-800 rounded-xl shadow-xl py-1.5 z-30 overflow-hidden">
                  {!disappearSubmenuOpen ? (
                    <button
                      onClick={() => setDisappearSubmenuOpen(true)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-gray-200 hover:bg-[#ffffff0d] transition"
                    >
                      <Timer size={13} />
                      Disappearing messages
                    </button>
                  ) : (
                    <>
                      <p className="px-4 py-2 text-[12px] text-gray-500 uppercase tracking-wide">
                        Disappearing messages
                      </p>
                      {DISAPPEAR_OPTIONS.map((opt) => (
                        <button
                          key={opt.seconds}
                          onClick={() => handleSetDisappearing(opt.seconds)}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-[14px] text-gray-200 hover:bg-[#ffffff0d] transition"
                        >
                          {opt.label}
                          {(selectedChat.disappearingDuration || 0) === opt.seconds && (
                            <Check size={16} className="text-[#00a884]" />
                          )}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Disappearing messages system banner */}
      {disappearingOn && (
        <div className="bg-[#202427] text-center py-1.5 px-4 shrink-0">
          <p className="text-[12px] text-gray-400 flex items-center justify-center gap-1.5">
            <Timer size={13} />
            New messages will disappear after {currentDisappearLabel.toLowerCase()}
          </p>
        </div>
      )}

      {/* Messages area */}
      <main className="flex-1 min-h-0 overflow-hidden chat-wallpaper bg-[#0b0f12]">
        <div className="messages-scroll h-full overflow-y-auto p-6 space-y-1 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <p className="text-gray-400 text-center text-sm">Start chatting...</p>
          )}
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
      </main>

      {/* Reply preview bar */}
      {replyingTo && (
        <div className="px-5 pt-2 border-t border-gray-800 bg-black/40 backdrop-blur-sm shrink-0">
          <div className="max-w-4xl mx-auto flex items-stretch bg-gray-800 rounded-xl overflow-hidden">
            <div className="w-1 bg-[#00a884] shrink-0" />
            <div className="flex-1 py-2 px-3 min-w-0">
              <p className="text-[13px] font-medium text-[#00a884]">
                {replyingTo.sender?._id === user._id ? "You" : replyingTo.sender?.name}
              </p>
              <p className="text-[13px] text-gray-400 truncate">{replyingTo.content}</p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="px-3 flex items-center text-gray-400 hover:text-white transition"
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

      {/* Input area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) send();
        }}
        className="px-5 py-3 border-t border-gray-800 bg-black/40 backdrop-blur-sm shrink-0 relative"
      >
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((v) => !v)}
            className={`w-8 h-8 flex items-center justify-center transition ${showEmojiPicker ? "text-[#00a884]" : "text-gray-400 hover:text-[#00a884]"
              }`}
          >
            <Smile size={23} />
          </button>
          <button type="button" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#00a884] transition">
            <Paperclip size={21} />
          </button>
          <input
            id="messageInput"
            ref={inputRef}
            value={text}
            onChange={handleTyping}
            onFocus={() => setShowEmojiPicker(false)}
            autoComplete="off"
            type="text"
            placeholder="Type a message..."
            className="flex-1 rounded-3xl py-3 px-4 bg-gray-800 text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-emerald-600 transition"
          />
          {!text.trim() && (
            <button type="button" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#00a884] transition">
              <Camera size={21} />
            </button>
          )}
          <button
            id="sendBtn"
            type={text.trim() ? "submit" : "button"}
            className="bg-emerald-600 hover:bg-emerald-700 p-2 rounded-full w-10 h-10 flex items-center justify-center"
            title={text.trim() ? "Send" : "Voice message"}
          >
            {text.trim() ? <Send size={18} className="text-white" /> : <Mic size={20} className="text-white" />}
          </button>
        </div>
      </form>
    </div>
  );
}