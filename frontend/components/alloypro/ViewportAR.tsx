'use client';

import React, { useCallback, useState } from 'react';
import { Track } from 'livekit-client';
import { SwitchCamera } from 'lucide-react';
import { VideoTrack, useLocalParticipant } from '@livekit/components-react';
import { useLocalTrackRef } from '@/components/app/tile-layout';
import { useInputControls } from '@/hooks/agents-ui/use-agent-control-bar';
import { useCopilotStore } from '@/hooks/useCopilotStore';
import { TechLabel } from './IndustrialAtoms';

const ViewportAR: React.FC = () => {
  const { workflowState, hasPermissions } = useCopilotStore();
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const cameraTrack = useLocalTrackRef(Track.Source.Camera);
  const { localParticipant } = useLocalParticipant();
  const { cameraToggle } = useInputControls({ saveUserChoices: false });

  React.useEffect(() => {
    if (!cameraToggle.enabled && !cameraToggle.pending) {
      cameraToggle.toggle(true).catch(console.error);
    }
  }, [cameraToggle.enabled, cameraToggle.pending, cameraToggle.toggle]);

  const toggleCamera = useCallback(async () => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode);

    // In LiveKit, we usually handle this by switching the device.
    // For now, we'll assume the camera track handles its own facing mode if configured,
    // or we'd use localParticipant.setCameraEnabled(...) with constraints.
  }, [facingMode]);

  const isCameraEnabled = cameraTrack && !cameraTrack.publication.isMuted;

  // ── Permission/Off Screen ──
  if (!isCameraEnabled) {
    return (
      <div className="bg-background relative flex h-[60vh] w-full flex-col items-center justify-center p-6">
        <div className="bg-grid-overlay absolute inset-0 opacity-40" />
        <div className="relative z-10 flex max-w-xs flex-col items-start gap-4">
          <TechLabel>System Access</TechLabel>
          <p className="text-foreground text-sm leading-relaxed">
            AlloyPro requires <span className="text-accent font-semibold">camera</span> and{' '}
            <span className="text-accent font-semibold">microphone</span> access for the augmented
            HUD overlay and voice commands.
          </p>
          {!hasPermissions && (
            <p className="text-destructive font-mono text-xs">
              ✕ CAMERA MUTED OR DISABLED — Enable in control bar
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Live Camera Feed ──
  return (
    <div className="bg-background relative h-[60vh] w-full overflow-hidden">
      <VideoTrack trackRef={cameraTrack} className="absolute inset-0 h-full w-full object-cover" />

      {/* Grid overlay */}
      <div className="bg-grid-overlay absolute inset-0 z-10" />

      {/* Top-left HUD label */}
      <div className="absolute top-4 left-4 z-20">
        <TechLabel>{facingMode === 'environment' ? 'Rear Camera' : 'Front Camera'}</TechLabel>
      </div>

      {/* Camera flip button — top right */}
      <button
        onClick={toggleCamera}
        className="active:bg-foreground active:text-background absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-sm border border-white/10 bg-white/5 transition-colors"
        aria-label="Switch camera"
      >
        <SwitchCamera className="text-foreground h-4 w-4" />
      </button>

      {/* Scanning bounding box during part_identification */}
      {workflowState === 'part_identification' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="border-destructive bg-destructive/10 animate-scan-shrink h-48 w-48 rounded-sm border-2 border-dashed">
            <div className="animate-scan-pulse h-full w-full" />
          </div>
        </div>
      )}

      {/* Bottom gradient fade into cockpit */}
      <div className="from-background absolute right-0 bottom-0 left-0 z-10 h-16 bg-gradient-to-t to-transparent" />
    </div>
  );
};

export default ViewportAR;
