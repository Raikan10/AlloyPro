import React, { useCallback, useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { useCopilotStore } from "@/store/useCopilotStore";
import { TechLabel } from "@/components/UI/IndustrialAtoms";
import { SwitchCamera } from "lucide-react";

const ViewportAR: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const { workflowState, hasPermissions, setPermissions } = useCopilotStore();
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied">("prompt");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermissionState("granted");
      setPermissions(true);
    } catch {
      setPermissionState("denied");
      setPermissions(false);
    }
  }, [setPermissions]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop());
        setPermissionState("granted");
        setPermissions(true);
      })
      .catch(() => {});
  }, [setPermissions]);

  // ── Permission Request Screen ──
  if (permissionState === "prompt" || permissionState === "denied") {
    return (
      <div className="relative h-[60vh] w-full bg-background flex flex-col items-center justify-center p-6">
        <div className="bg-grid-overlay absolute inset-0 opacity-40" />
        <div className="relative z-10 flex flex-col items-start gap-4 max-w-xs">
          <TechLabel>System Access</TechLabel>
          <p className="text-foreground text-sm leading-relaxed">
            AlloyPro requires <span className="text-accent font-semibold">camera</span> and{" "}
            <span className="text-accent font-semibold">microphone</span> access for the augmented HUD overlay and voice commands.
          </p>
          {permissionState === "denied" && (
            <p className="text-destructive text-xs font-mono">
              ✕ PERMISSIONS DENIED — Enable in browser settings
            </p>
          )}
          <button
            onClick={requestPermissions}
            className="w-full bg-accent/10 border border-accent/30 text-accent uppercase tracking-widest text-xs py-4 transition-colors active:bg-accent active:text-background"
          >
            {permissionState === "denied" ? "Retry Access" : "Grant Permissions"}
          </button>
        </div>
      </div>
    );
  }

  // ── Live Camera Feed ──
  return (
    <div className="relative h-[60vh] w-full bg-background overflow-hidden">
      <Webcam
        ref={webcamRef}
        audio={false}
        videoConstraints={{ facingMode }}
        className="absolute inset-0 w-full h-full object-cover"
        muted
      />

      {/* Grid overlay */}
      <div className="bg-grid-overlay absolute inset-0 z-10" />

      {/* Top-left HUD label */}
      <div className="absolute top-4 left-4 z-20">
        <TechLabel>{facingMode === "environment" ? "Rear Camera" : "Front Camera"}</TechLabel>
      </div>

      {/* Camera flip button — top right */}
      <button
        onClick={toggleCamera}
        className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm active:bg-foreground active:text-background transition-colors"
        aria-label="Switch camera"
      >
        <SwitchCamera className="w-4 h-4 text-foreground" />
      </button>

      {/* Scanning bounding box during part_identification */}
      {workflowState === "part_identification" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="w-48 h-48 border-2 border-dashed border-destructive bg-destructive/10 rounded-sm animate-scan-shrink">
            <div className="w-full h-full animate-scan-pulse" />
          </div>
        </div>
      )}

      {/* Bottom gradient fade into cockpit */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-10" />
    </div>
  );
};

export default ViewportAR;
