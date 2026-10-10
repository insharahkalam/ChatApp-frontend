import { useRef, useEffect, useState } from "react";
import { Clock, Smile, Heart, Cat, Coffee, Trophy, Lightbulb, Flag } from "lucide-react";

const CATEGORIES = [
  {
    key: "smileys",
    icon: Smile,
    emojis: ["😀", "😁", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😕", "😟", "🙁", "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬"],
  },
  {
    key: "love",
    icon: Heart,
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "😍", "🥰", "😘", "💋", "💑", "💏"],
  },
  {
    key: "animals",
    icon: Cat,
    emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐢", "🐍", "🦎", "🐙", "🦑", "🦀", "🐡", "🐠", "🐬", "🐳", "🐋", "🦈"],
  },
  {
    key: "food",
    icon: Coffee,
    emojis: ["☕", "🍵", "🍺", "🍻", "🍷", "🥂", "🍾", "🍹", "🍔", "🍟", "🍕", "🌭", "🥪", "🌮", "🌯", "🍜", "🍝", "🍣", "🍱", "🍰", "🎂", "🍩", "🍪", "🍫", "🍬", "🍭", "🍎", "🍌", "🍇", "🍓", "🍒", "🍑", "🍍", "🥭", "🥑", "🥕", "🌽"],
  },
  {
    key: "activities",
    icon: Trophy,
    emojis: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🥊", "🥋", "🎯", "🎮", "🎲", "🎸", "🎹", "🎤", "🎧", "🎬", "🏆", "🥇", "🥈", "🥉", "🏅"],
  },
  {
    key: "objects",
    icon: Lightbulb,
    emojis: ["💡", "🔦", "🕯️", "📱", "💻", "⌨️", "🖥️", "🖨️", "📷", "📸", "📹", "🎥", "📞", "☎️", "📺", "📻", "⏰", "⏱️", "🔋", "🔌", "💰", "💵", "💳", "✉️", "📩", "📦", "🔒", "🔑", "🔨", "🔧", "⚙️"],
  },
  {
    key: "symbols",
    icon: Flag,
    emojis: ["✅", "❌", "❓", "❗", "⭐", "🌟", "✨", "🔥", "💯", "💢", "💥", "💫", "💦", "💨", "🕳️", "🚩", "🎉", "🎊", "🎈", "🎁", "🏁"],
  },
];

export default function EmojiPicker({ onSelect, onClose }) {
  const ref = useRef(null);
  const [active, setActive] = useState("smileys");
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wisp_recent_emojis") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const closeOnOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, [onClose]);

  const pick = (emoji) => {
    onSelect(emoji);
    const updated = [emoji, ...recent.filter((e) => e !== emoji)].slice(0, 24);
    setRecent(updated);
    try {
      localStorage.setItem("wisp_recent_emojis", JSON.stringify(updated));
    } catch { }
  };

  const activeCategory = CATEGORIES.find((c) => c.key === active);
  const showRecent = active === "recent";
  const list = showRecent ? recent : activeCategory.emojis;

  return (
    <div
      ref={ref}
      className="absolute bottom-[68px] left-5 w-[340px] h-[380px] bg-[#202427] rounded-2xl shadow-2xl border border-gray-800 flex flex-col z-40 overflow-hidden"
    >
      {/* Category tabs */}
      <div className="flex items-center border-b border-gray-800 px-1 py-1 shrink-0">
        <TabBtn active={showRecent} onClick={() => setActive("recent")} title="Recently used">
          <Clock size={18} />
        </TabBtn>
        {CATEGORIES.map((c) => (
          <TabBtn key={c.key} active={active === c.key} onClick={() => setActive(c.key)} title={c.key}>
            <c.icon size={18} />
          </TabBtn>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="flex-1 overflow-y-auto p-2 grid grid-cols-8 gap-1 content-start scrollbar-thin scrollbar-thumb-gray-700">
        {list.length === 0 && showRecent && (
          <p className="col-span-8 text-center text-gray-500 text-xs mt-8">No recently used emojis</p>
        )}
        {list.map((emoji, i) => (
          <button
            type="button"
            key={emoji + i}
            onClick={() => pick(emoji)}
            className="text-2xl w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#ffffff0d] transition"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

function TabBtn({ children, active, onClick, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex-1 h-9 flex items-center justify-center rounded-lg transition ${active
          ? "text-[#00a884] border-b-2 border-[#00a884]"
          : "text-gray-400 hover:text-white"
        }`}
    >
      {children}
    </button>
  );
}