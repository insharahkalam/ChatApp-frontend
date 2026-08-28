import { useState, useRef, useEffect } from "react";
import {
  Check,
  CheckCheck,
  ChevronDown,
  Trash2,
  Pencil,
  Copy,
  Reply,
  X,
  SmilePlus,
} from "lucide-react";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export default function Message({
  msg,
  isOwn,
  isRead,
  currentUserId,
  repliedMessage,
  onDelete,
  onEdit,
  onReact,
  onReply,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reactionPickerOpen, setReactionPickerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(msg.content);
  const menuRef = useRef(null);
  const reactionRef = useRef(null);

  useEffect(() => {
    const closeOnOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (reactionRef.current && !reactionRef.current.contains(e.target)) setReactionPickerOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, []);

  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const saveEdit = () => {
    if (editText.trim() && editText !== msg.content) {
      onEdit?.(msg._id, editText.trim());
    }
    setIsEditing(false);
  };

  const copyText = () => {
    navigator.clipboard.writeText(msg.content);
    setMenuOpen(false);
  };

  const renderTicks = () => {
    if (!isOwn) return null;
    if (isRead) return <CheckCheck size={16} className="text-[#53bdeb]" />;
    if (msg.delivered) return <CheckCheck size={16} className="text-[#8696a0]" />;
    return <Check size={16} className="text-[#8696a0]" />;
  };

  const reactions = msg.reactions || {};
  const reactionEntries = Object.entries(reactions); // [userId, emoji]
  const groupedReactions = reactionEntries.reduce((acc, [, emoji]) => {
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {});
  const hasReactions = Object.keys(groupedReactions).length > 0;

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} group mb-1`}>
      <div className="relative max-w-[65%]">
        {/* Floating quick-action bar on hover: reaction + reply + menu */}
        <div
          className={`absolute -top-4 ${isOwn ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1"
            } opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5 bg-[#233138] rounded-full shadow-lg px-1 py-1 z-30`}
        >
          <div className="relative" ref={reactionRef}>
            <button
              onClick={() => setReactionPickerOpen((v) => !v)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-[#8696a0] hover:text-white transition"
              title="React"
            >
              <SmilePlus size={16} />
            </button>
            {reactionPickerOpen && (
              <div
                className={`absolute -top-12 ${isOwn ? "right-0" : "left-0"
                  } bg-[#233138] rounded-full shadow-xl px-2 py-1.5 flex items-center gap-1 z-40`}
              >
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact?.(msg._id, emoji);
                      setReactionPickerOpen(false);
                    }}
                    className="text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onReply?.(msg)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-[#8696a0] hover:text-white transition"
            title="Reply"
          >
            <Reply size={16} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-[#8696a0] hover:text-white transition"
              title="More"
            >
              <ChevronDown size={16} />
            </button>

            {menuOpen && (
              <div
                className={`absolute top-8 ${isOwn ? "right-0" : "left-0"
                  } w-44 bg-[#233138] rounded-md shadow-xl py-1.5 z-40 overflow-hidden`}
              >
                <MenuItem icon={<Reply size={15} />} label="Reply" onClick={() => { onReply?.(msg); setMenuOpen(false); }} />
                <MenuItem icon={<Copy size={15} />} label="Copy" onClick={copyText} />
                {isOwn && (
                  <MenuItem
                    icon={<Pencil size={15} />}
                    label="Edit"
                    onClick={() => { setIsEditing(true); setMenuOpen(false); }}
                  />
                )}
                {isOwn && (
                  <MenuItem
                    icon={<Trash2 size={15} />}
                    label="Delete"
                    danger
                    onClick={() => { onDelete?.(msg._id); setMenuOpen(false); }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bubble */}
        <div
          className={`px-2.5 pt-1.5 pb-1 rounded-lg shadow-sm ${isOwn ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none" : "bg-[#202c33] text-[#e9edef] rounded-tl-none"
            } ${hasReactions ? "mb-3" : ""}`}
        >
          {/* Quoted reply block */}
          {repliedMessage && (
            <div
              className={`flex mb-1.5 rounded overflow-hidden cursor-pointer ${isOwn ? "bg-black/15" : "bg-white/5"
                }`}
            >
              <div className="w-1 bg-[#00a884] shrink-0" />
              <div className="py-1 px-2 min-w-0">
                <p className="text-[12.5px] font-medium text-[#00a884] truncate">
                  {repliedMessage.sender?._id === currentUserId ? "You" : repliedMessage.sender?.name || "Unknown"}
                </p>
                <p className="text-[12.5px] text-[#c7c9cb] truncate">{repliedMessage.content}</p>
              </div>
            </div>
          )}

          {isEditing ? (
            <div className="flex items-center gap-2 min-w-[200px]">
              <input
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                className="flex-1 bg-[#0b141a] text-[#e9edef] text-[14.5px] px-2 py-1 rounded outline-none"
              />
              <button onClick={saveEdit} className="text-[#00a884] text-xs font-semibold">Save</button>
              <button onClick={() => setIsEditing(false)} className="text-[#8696a0]"><X size={16} /></button>
            </div>
          ) : (
            <p className="text-[14.5px] leading-snug break-words pr-6">{msg.content}</p>
          )}

          <div className="flex items-center justify-end gap-1 mt-0.5 select-none">
            {msg.edited && <span className="text-[10px] text-[#8696a0] italic">edited</span>}
            <span className="text-[10.5px] text-[#8696a0]">{time}</span>
            {renderTicks()}
          </div>
        </div>

        {/* Floating reaction chips (bottom edge of bubble, WhatsApp style) */}
        {hasReactions && (
          <div className={`absolute -bottom-3 ${isOwn ? "right-2" : "left-2"} flex gap-0.5`}>
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onReact?.(msg._id, emoji)}
                className="bg-[#233138] rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shadow-md border border-black/20 hover:scale-105 transition-transform"
              >
                <span className="text-[13px]">{emoji}</span>
                {count > 1 && <span className="text-[10px] text-[#8696a0]">{count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2 text-[14px] transition ${danger ? "text-red-400 hover:bg-[#182229]" : "text-[#e9edef] hover:bg-[#182229]"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}