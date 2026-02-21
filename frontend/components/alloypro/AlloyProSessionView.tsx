'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useSessionContext } from '@livekit/components-react';
import CockpitSheet from './CockpitSheet';
import ViewportAR from './ViewportAR';

export const AlloyProSessionView: React.FC = () => {
  const session = useSessionContext();

  return (
    <div className="bg-background relative flex h-svh w-svw flex-col overflow-hidden">
      {/* HUD Layer (AR Viewport) */}
      <ViewportAR />

      {/* Control Layer (Cockpit Sheet) */}
      <CockpitSheet />

      {/* Disconnect/Close button — top right, above camera toggle */}
      <button
        onClick={() => session.end()}
        className="bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20 fixed top-20 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-sm border shadow-lg transition-colors"
        aria-label="End session"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Connection Status Overlay (Optional) */}
      {!session.isConnected && (
        <div className="bg-background/80 absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="border-accent h-12 w-12 animate-spin rounded-full border-2 border-t-transparent" />
            <p className="text-accent font-mono text-xs tracking-[0.2em] uppercase">
              Reconnecting System...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlloyProSessionView;
