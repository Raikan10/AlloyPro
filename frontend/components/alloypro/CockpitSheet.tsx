'use client';

import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useSessionContext, useSessionMessages } from '@livekit/components-react';
import { useInputControls } from '@/hooks/agents-ui/use-agent-control-bar';
import { useCopilotStore } from '@/hooks/useCopilotStore';
import { TechLabel, VoicePulse } from './IndustrialAtoms';
import IdleView from './views/IdleView';
import PartIDView from './views/PartIDView';
import ProcedureView from './views/ProcedureView';
import ReportingView from './views/ReportingView';

const CockpitSheet: React.FC = () => {
  const { workflowState, isMicActive, toggleMic } = useCopilotStore();
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const { microphoneToggle } = useInputControls({ saveUserChoices: false });

  React.useEffect(() => {
    if (isMicActive !== microphoneToggle.enabled && !microphoneToggle.pending) {
      microphoneToggle.toggle(isMicActive).catch(console.error);
    }
  }, [isMicActive, microphoneToggle.enabled, microphoneToggle.pending, microphoneToggle.toggle]);

  const showVoiceControls = workflowState !== 'idle';

  // Get the most recent user transcript
  const lastUserMessage = [...messages].reverse().find((m) => m.from?.isLocal);
  const voiceTranscript = (lastUserMessage as any)?.text;

  return (
    <div className="bg-background/90 fixed bottom-0 left-0 z-30 h-[40vh] w-full overflow-y-auto rounded-t-[2rem] border-t border-white/10 backdrop-blur-md">
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-2">
        <div className="h-1 w-12 rounded-full bg-white/20" />
      </div>

      <div className="space-y-4 px-6 pb-6">
        {/* Voice controls bar */}
        {showVoiceControls && (
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
        )}

        {/* Voice transcript */}
        {showVoiceControls && voiceTranscript && (
          <div className="border-l-accent rounded-sm border border-l-2 border-white/5 bg-white/[0.02] p-3">
            <TechLabel>Voice Note</TechLabel>
            <p className="text-foreground/70 mt-1 font-mono text-xs leading-relaxed">
              {voiceTranscript}
            </p>
          </div>
        )}

        {/* Workflow views */}
        {workflowState === 'idle' && <IdleView />}
        {workflowState === 'procedure' && <ProcedureView />}
        {workflowState === 'part_identification' && <PartIDView />}
        {workflowState === 'reporting' && <ReportingView />}
      </div>
    </div>
  );
};

export default CockpitSheet;
