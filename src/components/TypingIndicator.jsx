export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 w-fit bg-[#202c33] border border-gray-800 rounded-full shadow-sm">
      <span className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce" />
      <span className="w-2 h-2 rounded-full bg-[#25c9a0] animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
    </div>
  );
}