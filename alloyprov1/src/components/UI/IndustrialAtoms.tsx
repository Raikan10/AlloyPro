import React from "react";

// ── TechLabel ──────────────────────────────────────────────
export const TechLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-accent font-sans">
    {children}
  </span>
);

// ── MetricBadge ────────────────────────────────────────────
export const MetricBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-3 py-1 bg-success/10 border border-success/30 text-success text-xs font-semibold rounded-sm inline-block">
    {children}
  </div>
);

// ── BeamButton ─────────────────────────────────────────────
export const BeamButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ children, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full bg-white/5 border border-white/10 text-foreground uppercase tracking-widest text-xs py-4 relative overflow-hidden active:bg-foreground active:text-background transition-colors disabled:opacity-30 disabled:pointer-events-none"
  >
    {children}
  </button>
);

// ── VoicePulse ─────────────────────────────────────────────
export const VoicePulse: React.FC = () => (
  <div className="flex items-center gap-[3px] h-6">
    {[0, 150, 300].map((delay) => (
      <div
        key={delay}
        className="w-1 bg-red-500 rounded-full animate-voice-bar"
        style={{ animationDelay: `${delay}ms` }}
      />
    ))}
  </div>
);
