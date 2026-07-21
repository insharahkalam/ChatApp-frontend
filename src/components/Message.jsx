export default function Message({ msg, isOwn }) {
  return (
    <div className={`flex mb-2 ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-xs px-4 py-2 rounded-2xl shadow ${isOwn ? "bg-indigo-600 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none"}`}>
        {!isOwn && <p className="text-xs font-semibold text-indigo-500 mb-1">{msg.sender.name}</p>}
        <p>{msg.content}</p>
        <p className={`text-[10px] mt-1 ${isOwn ? "text-indigo-100" : "text-gray-400"}`}>
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
