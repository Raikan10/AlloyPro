'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Mic, MicOff } from 'lucide-react';
import { useRoomContext, useSessionContext, useSessionMessages } from '@livekit/components-react';
import { useInputControls } from '@/hooks/agents-ui/use-agent-control-bar';
import { useCopilotStore } from '@/hooks/useCopilotStore';
import { BeamButton, TechLabel, VoicePulse } from './IndustrialAtoms';
import IdleView from './views/IdleView';
import PartIDView from './views/PartIDView';
import ProcedureView from './views/ProcedureView';
import ReportingView from './views/ReportingView';

const CockpitSheet: React.FC = () => {
  const router = useRouter();
  const { workflowState, isMicActive, toggleMic, selectedOrder } = useCopilotStore();
  const session = useSessionContext();
  const room = useRoomContext();
  const { messages } = useSessionMessages(session);
  const { microphoneToggle } = useInputControls({ saveUserChoices: false });

  const handleDone = async () => {
    await room.disconnect();
    if (selectedOrder) {
      router.push(`/orders/${selectedOrder.id}/purchase`);
    } else {
      router.push('/orders');
    }
  };

  React.useEffect(() => {
    if (isMicActive !== microphoneToggle.enabled && !microphoneToggle.pending) {
      microphoneToggle.toggle(isMicActive).catch(console.error);
    }
  }, [isMicActive, microphoneToggle.enabled, microphoneToggle.pending, microphoneToggle.toggle]);

  const showVoiceControls = workflowState !== 'idle';

  return (
    <div className="bg-background/90 fixed bottom-0 left-0 z-30 h-[40vh] w-full overflow-y-auto rounded-t-[2rem] border-t border-white/10 backdrop-blur-md">
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-2">
        <div className="h-1 w-12 rounded-full bg-white/20" />
      </div>

      <div className="space-y-4 px-6 pb-6">
        {/* Voice controls bar */}
        {showVoiceControls && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMic}
                className={`flex h-10 w-10 items-center justify-center rounded-sm border transition-colors ${
                  isMicActive
                    ? 'bg-destructive/20 border-destructive/40 text-destructive'
                    : 'text-muted-foreground border-white/10 bg-white/5'
                }`}
                aria-label={isMicActive ? 'Stop dictation' : 'Start dictation'}
              >
                {isMicActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>

              {isMicActive && <VoicePulse />}

              <TechLabel>{isMicActive ? 'Listening…' : 'Voice Off'}</TechLabel>
            </div>

            <button
              onClick={handleDone}
              className="flex items-center gap-2 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20"
            >
              <CheckCircle className="h-4 w-4" />
              Done
            </button>
          </div>
        )}

        {/* Technical log (Transcript) */}
        {showVoiceControls && messages.length > 0 && (
          <div className="border-l-accent space-y-2 rounded-sm border border-l-2 border-white/5 bg-white/[0.02] p-3">
            <TechLabel>Diagnostic Log</TechLabel>
            <div className="max-h-32 space-y-2 overflow-y-auto pr-2 [scrollbar-width:none]">
              {messages.slice(-3).map((msg) => {
                const isLocal = msg.from?.isLocal;
                return (
                  <div
                    key={msg.id}
                    className="flex items-start gap-2 border-t border-white/5 pt-1.5 first:border-0 first:pt-0"
                  >
                    <span
                      className={`mt-0.5 shrink-0 font-mono text-[9px] font-bold tracking-tighter uppercase ${isLocal ? 'text-accent' : 'text-emerald-400'}`}
                    >
                      {isLocal ? 'USER' : 'AGENT'}
                    </span>
                    <p className="text-foreground/90 font-mono text-[11px] leading-tight">
                      {msg.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Workflow views */}
        {workflowState === 'idle' && <IdleView />}
        {workflowState === 'part_identification' && <PartIDView />}
        {workflowState === 'reporting' && <ReportingView />}
      </div>
    </div>
  );
};

export default CockpitSheet;
