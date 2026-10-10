import { useState, useRef, useEffect } from "react";
import { Check, CheckCheck, ChevronDown, Trash2, Pencil, Copy, Reply, Timer, X, SmilePlus } from "lucide-react";

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
    if (msg.delivered) return <CheckCheck size={16} className="text-gray-300" />;
    return <Check size={16} className="text-gray-300" />;
  };

  const reactions = msg.reactions || {};
  const reactionEntries = Object.entries(reactions); // [userId, emoji]
  const groupedReactions = reactionEntries.reduce((acc, [, emoji]) => {
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {});
  const hasReactions = Object.keys(groupedReactions).length > 0;

  const barBtn =
    "w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#ffffff0d] text-gray-400 hover:text-[#00a884] transition";

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} group mb-1`}>
      <div className="relative max-w-[65%]">
        {/* Floating quick-action bar on hover: reaction + reply + menu */}
        <div
          className={`absolute -top-4 ${
            isOwn ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1"
          } opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5 bg-[#202427] border border-gray-800 rounded-full shadow-lg px-1 py-1 z-30`}
        >
          <div className="relative" ref={reactionRef}>
            <button
              onClick={() => setReactionPickerOpen((v) => !v)}
              className={barBtn}
              title="React"
            >
              <SmilePlus size={16} />
            </button>
            {reactionPickerOpen && (
              <div
                className={`absolute -top-12 ${
                  isOwn ? "right-0" : "left-0"
                } bg-[#202427] border border-gray-800 rounded-full shadow-xl px-2 py-1.5 flex items-center gap-1 z-40`}
              >
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact?.(msg._id, emoji);
                      setReactionPickerOpen(false);
                    }}
                    className="text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#ffffff0d] hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => onReply?.(msg)} className={barBtn} title="Reply">
            <Reply size={16} />
          </button>

          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen((v) => !v)} className={barBtn} title="More">
              <ChevronDown size={16} />
            </button>

            {menuOpen && (
              <div
                className={`absolute top-8 ${
                  isOwn ? "right-0" : "left-0"
                } w-44 bg-[#202427] border border-gray-800 rounded-xl shadow-xl py-1.5 z-40 overflow-hidden`}
              >
                <MenuItem
                  icon={<Reply size={15} />}
                  label="Reply"
                  onClick={() => {
                    onReply?.(msg);
                    setMenuOpen(false);
                  }}
                />
                <MenuItem icon={<Copy size={15} />} label="Copy" onClick={copyText} />
                {isOwn && (
                  <MenuItem
                    icon={<Pencil size={15} />}
                    label="Edit"
                    onClick={() => {
                      setIsEditing(true);
                      setMenuOpen(false);
                    }}
                  />
                )}
                {isOwn && (
                  <MenuItem
                    icon={<Trash2 size={15} />}
                    label="Delete"
                    danger
                    onClick={() => {
                      onDelete?.(msg._id);
                      setMenuOpen(false);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bubble */}
        <div
          className={`px-3 pt-2 pb-1 rounded-2xl shadow-sm ${
            isOwn
              ? "bg-[#005c4b] text-gray-100 rounded-tr-md"
              : "bg-[#202c33] text-gray-100 rounded-tl-md"
          } ${hasReactions ? "mb-3" : ""}`}
        >
          {/* Quoted reply block */}
          {repliedMessage && (
            <div className="flex mb-1.5 rounded-lg overflow-hidden cursor-pointer bg-black/20">
              <div className="w-1 shrink-0 bg-[#00a884]" />
              <div className="py-1 px-2 min-w-0">
                <p className="text-[12.5px] font-medium truncate text-[#00a884]">
                  {repliedMessage.sender?._id === currentUserId
                    ? "You"
                    : repliedMessage.sender?.name || "Unknown"}
                </p>
                <p className="text-[12.5px] truncate text-gray-300">{repliedMessage.content}</p>
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
                className="flex-1 text-[14.5px] px-2 py-1 rounded-lg outline-none bg-black/25 text-gray-100"
              />
              <button onClick={saveEdit} className="text-xs font-semibold text-[#00a884]">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
          ) : (
            <p className="text-[14.5px] leading-snug break-words pr-6">{msg.content}</p>
          )}

          <div className="flex items-center justify-end gap-1 mt-0.5 select-none">
            {msg.disappearing && <Timer size={11} className="text-gray-400" />}
            {msg.edited && <span className="text-[10px] italic text-gray-400">edited</span>}
            <span className="text-[10.5px] text-gray-400">{time}</span>
            {renderTicks()}
          </div>
        </div>

        {/* Floating reaction chips (bottom edge of bubble) */}
        {hasReactions && (
          <div className={`absolute -bottom-3 ${isOwn ? "right-2" : "left-2"} flex gap-0.5`}>
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onReact?.(msg._id, emoji)}
                className="bg-[#202427] rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shadow-md border border-gray-800 hover:scale-105 transition-transform"
              >
                <span className="text-[13px]">{emoji}</span>
                {count > 1 && <span className="text-[10px] text-gray-400">{count}</span>}
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
      className={`w-full flex items-center gap-2.5 px-4 py-2 text-[14px] transition ${
        danger ? "text-red-400 hover:bg-red-500/10" : "text-gray-200 hover:bg-[#ffffff0d]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}