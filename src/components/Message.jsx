export default function Message({ msg, isOwn, isRead }) {
  return (
    <div className={`flex mb-1.5 ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] sm:max-w-xs px-3 py-2 shadow-sm text-[14.5px] leading-snug ${isOwn ? "bg-[#DCF8C6] text-gray-800 rounded-lg rounded-tr-none" : "bg-white text-gray-800 rounded-lg rounded-tl-none"
          }`}
      >
        {!isOwn && <p className="text-xs font-semibold text-[#075E54] mb-0.5">{msg.sender.name}</p>}
        <p className="break-words">{msg.content}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <p className="text-[10px] text-gray-400">
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
          {isOwn && (
            <span className={`text-[13px] ${isRead ? "text-[#34B7F1]" : "text-gray-400"}`}>
              {isRead ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}