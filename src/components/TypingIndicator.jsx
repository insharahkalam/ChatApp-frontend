export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 p-2 w-fit bg-white rounded-full shadow">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
    </div>
  );
}
