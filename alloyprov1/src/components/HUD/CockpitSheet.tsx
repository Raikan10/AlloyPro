import React from "react";
import { useCopilotStore } from "@/store/useCopilotStore";
import { useVoiceDictation } from "@/hooks/useVoiceDictation";
import { TechLabel, VoicePulse } from "@/components/UI/IndustrialAtoms";
import { Mic, MicOff } from "lucide-react";
import IdleView from "@/components/HUD/views/IdleView";
import ProcedureView from "@/components/HUD/views/ProcedureView";
import PartIDView from "@/components/HUD/views/PartIDView";
import ReportingView from "@/components/HUD/views/ReportingView";

const CockpitSheet: React.FC = () => {
  const { workflowState, voiceTranscript, isMicActive } = useCopilotStore();
  const { toggleMic, isSupported } = useVoiceDictation();

  const showVoiceControls = workflowState !== "idle";

  return (
    <div className="fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-md border-t border-white/10 rounded-t-[2rem] h-[40vh] overflow-y-auto z-30">
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-2">
        <div className="w-12 h-1 bg-white/20 rounded-full" />
      </div>

      <div className="px-6 pb-6 space-y-4">
        {/* Voice controls bar */}
        {showVoiceControls && isSupported && (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMic}
              className={`w-10 h-10 flex items-center justify-center border rounded-sm transition-colors ${
                isMicActive
                  ? "bg-destructive/20 border-destructive/40 text-destructive"
                  : "bg-white/5 border-white/10 text-muted-foreground"
              }`}
              aria-label={isMicActive ? "Stop dictation" : "Start dictation"}
            >
              {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            {isMicActive && <VoicePulse />}

            <TechLabel>{isMicActive ? "Listening…" : "Voice Off"}</TechLabel>
          </div>
        )}

        {/* Voice transcript */}
        {showVoiceControls && voiceTranscript && (
          <div className="bg-white/[0.02] border border-white/5 rounded-sm p-3 border-l-2 border-l-accent">
            <TechLabel>Voice Note</TechLabel>
            <p className="text-foreground/70 text-xs mt-1 leading-relaxed font-mono">
              {voiceTranscript}
            </p>
          </div>
        )}

        {/* Workflow views */}
        {workflowState === "idle" && <IdleView />}
        {workflowState === "procedure" && <ProcedureView />}
        {workflowState === "part_identification" && <PartIDView />}
        {workflowState === "reporting" && <ReportingView />}
      </div>
    </div>
  );
};

export default CockpitSheet;
