// Icon-only mark: gradient chat bubble with a soundwave/pulse glyph inside —
// reads as "real-time conversation" rather than a generic bubble+dots icon.
// Scales cleanly down to favicon size (16px) since it's a single flat shape.
export default function BrandMark({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <defs>
        <linearGradient id="wispGradient" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6C5DD3" />
          <stop offset="1" stopColor="#FF6FA5" />
        </linearGradient>
      </defs>
      <path
        d="M8 6h18a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6H16l-7 6v-6a6 6 0 0 1-6-6v-8a6 6 0 0 1 6-6z"
        fill="url(#wispGradient)"
      />
      <path d="M13 18v-5" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <path d="M19.5 20v-9" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <path d="M26 18v-5" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Same mark with a soft breathing glow behind it — use once, for a hero /
// empty-state moment only (e.g. ChatBox's "no chat selected" screen).
// Don't reuse this everywhere or the motion loses its meaning.
export function BrandMarkGlow({ size = 48, boxSize = 96 }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: boxSize, height: boxSize }}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#FF6FA5] opacity-20 blur-xl animate-pulse" />
      <div
        className="relative bg-white rounded-3xl shadow-sm flex items-center justify-center"
        style={{ width: boxSize, height: boxSize }}
      >
        <BrandMark size={size} />
      </div>
    </div>
  );
}