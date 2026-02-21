import React from 'react';

// ── TechLabel ──────────────────────────────────────────────
export const TechLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-accent font-sans text-[10px] font-semibold tracking-[0.15em] uppercase">
    {children}
  </span>
);

// ── MetricBadge ────────────────────────────────────────────
export const MetricBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-success/10 border-success/30 text-success inline-block rounded-sm border px-3 py-1 text-xs font-semibold">
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
    className="text-foreground active:bg-foreground active:text-background relative w-full overflow-hidden border border-white/10 bg-white/5 py-4 text-xs tracking-widest uppercase transition-colors disabled:pointer-events-none disabled:opacity-30"
  >
    {children}
  </button>
);

// ── VoicePulse ─────────────────────────────────────────────
export const VoicePulse: React.FC = () => (
  <div className="flex h-6 items-center gap-[3px]">
    {[0, 150, 300].map((delay) => (
      <div
        key={delay}
        className="animate-voice-bar w-1 rounded-full bg-red-500"
        style={{ animationDelay: `${delay}ms` }}
      />
    ))}
  </div>
);
