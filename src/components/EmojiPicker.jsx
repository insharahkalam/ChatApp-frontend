import { useRef, useEffect, useState } from "react";
import { Clock, Smile, Heart, Cat, Coffee, Trophy, Lightbulb, Flag } from "lucide-react";

const CATEGORIES = [
  {
    key: "smileys",
    icon: Smile,
    emojis: ["😀","😁","😂","🤣","😊","😇","🙂","🙃","😉","😍","🥰","😘","😗","😙","😚","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🥵","🥶","🥴","😵","🤯","🤠","🥳","😎","🤓","🧐","😕","😟","🙁","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬"],
  },
  {
    key: "love",
    icon: Heart,
    emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","😍","🥰","😘","💋","💑","💏"],
  },
  {
    key: "animals",
    icon: Cat,
    emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐢","🐍","🦎","🐙","🦑","🦀","🐡","🐠","🐬","🐳","🐋","🦈"],
  },
  {
    key: "food",
    icon: Coffee,
    emojis: ["☕","🍵","🍺","🍻","🍷","🥂","🍾","🍹","🍔","🍟","🍕","🌭","🥪","🌮","🌯","🍜","🍝","🍣","🍱","🍰","🎂","🍩","🍪","🍫","🍬","🍭","🍎","🍌","🍇","🍓","🍒","🍑","🍍","🥭","🥑","🥕","🌽"],
  },
  {
    key: "activities",
    icon: Trophy,
    emojis: ["⚽","🏀","🏈","⚾","🎾","🏐","🏉","🎱","🏓","🏸","🥊","🥋","🎯","🎮","🎲","🎸","🎹","🎤","🎧","🎬","🏆","🥇","🥈","🥉","🏅"],
  },
  {
    key: "objects",
    icon: Lightbulb,
    emojis: ["💡","🔦","🕯️","📱","💻","⌨️","🖥️","🖨️","📷","📸","📹","🎥","📞","☎️","📺","📻","⏰","⏱️","🔋","🔌","💰","💵","💳","✉️","📩","📦","🔒","🔑","🔨","🔧","⚙️"],
  },
  {
    key: "symbols",
    icon: Flag,
    emojis: ["✅","❌","❓","❗","⭐","🌟","✨","🔥","💯","💢","💥","💫","💦","💨","🕳️","🚩","🎉","🎊","🎈","🎁","🏁"],
  },
];

export default function EmojiPicker({ onSelect, onClose }) {
  const ref = useRef(null);
  const [active, setActive] = useState("smileys");
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wa_recent_emojis") || "[]");
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
      localStorage.setItem("wa_recent_emojis", JSON.stringify(updated));
    } catch {}
  };

  const activeCategory = CATEGORIES.find((c) => c.key === active);
  const showRecent = active === "recent";

  return (
    <div
      ref={ref}
      className="absolute bottom-[68px] left-4 w-[340px] h-[380px] bg-[#233138] rounded-lg shadow-2xl border border-black/30 flex flex-col z-40 overflow-hidden"
    >
      {/* Category tabs */}
      <div className="flex items-center border-b border-white/10 px-1 py-1 shrink-0">
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
      <div className="flex-1 overflow-y-auto p-2 grid grid-cols-8 gap-1 content-start">
        {(showRecent ? recent : activeCategory.emojis).length === 0 && showRecent && (
          <p className="col-span-8 text-center text-[#8696a0] text-xs mt-8">
            No recently used emojis
          </p>
        )}
        {(showRecent ? recent : activeCategory.emojis).map((emoji, i) => (
          <button
            key={emoji + i}
            onClick={() => pick(emoji)}
            className="text-2xl w-9 h-9 flex items-center justify-center rounded hover:bg-white/10 transition"
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
      title={title}
      onClick={onClick}
      className={`flex-1 h-9 flex items-center justify-center rounded transition ${
        active ? "text-[#00a884] border-b-2 border-[#00a884]" : "text-[#8696a0] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}