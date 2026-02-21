import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { useCopilotStore, SystemType, OemBrand } from "@/store/useCopilotStore";
import { useLocalVoiceDictation } from "@/hooks/useLocalVoiceDictation";
import { TechLabel, BeamButton, VoicePulse } from "@/components/UI/IndustrialAtoms";
import {
  Camera,
  Video,
  X,
  Mic,
  MicOff,
  SwitchCamera,
  ArrowLeft,
  Circle,
  Square,
} from "lucide-react";

type CaptureMode = "photo" | "video";

const SYSTEMS: SystemType[] = ["HVAC", "Projector"];
const OEMS: OemBrand[] = ["Trox Technik", "Fuji", "Panasonic"];

const NewServiceRequest: React.FC = () => {
  const navigate = useNavigate();
  const { addServiceOrder } = useCopilotStore();
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Form state
  const [capturedMedia, setCapturedMedia] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [fullDetail, setFullDetail] = useState("");
  const [customer, setCustomer] = useState("");
  const [system, setSystem] = useState<SystemType | "">("");
  const [oemBrand, setOemBrand] = useState<OemBrand | "">("");
  const [location, setLocation] = useState("");
  const [locationDetail, setLocationDetail] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");

  // Camera state
  const [captureMode, setCaptureMode] = useState<CaptureMode>("photo");
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  // Voice dictation
  const handleTranscript = useCallback(
    (text: string) => {
      setDescription((prev) => (prev ? `${prev} ${text}` : text));
    },
    []
  );

  const { isMicActive, toggleMic, isSupported: voiceSupported } = useLocalVoiceDictation({
    onTranscript: handleTranscript,
  });

  const canSubmit =
    customer.trim() && system && oemBrand && description.trim();

  // Photo capture
  const capturePhoto = useCallback(() => {
    if (!webcamRef.current || capturedMedia.length >= 3) return;
    const screenshot = webcamRef.current.getScreenshot();
    if (screenshot) {
      setCapturedMedia((prev) => [...prev, screenshot]);
    }
  }, [capturedMedia.length]);

  // Video recording
  const startRecording = useCallback(() => {
    if (!webcamRef.current?.video?.srcObject) return;
    const stream = webcamRef.current.video.srcObject as MediaStream;
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setCapturedMedia((prev) => (prev.length < 3 ? [...prev, url] : prev));
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecordingVideo(true);
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecordingVideo(false);
  }, []);

  const removeMedia = (index: number) => {
    setCapturedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    addServiceOrder({
      customer: customer.trim(),
      system: system as SystemType,
      oemBrand: oemBrand as OemBrand,
      description: description.trim(),
      fullDetail: fullDetail.trim(),
      location: location.trim(),
      locationDetail: locationDetail.trim(),
      reportedAt: new Date().toISOString(),
      reporter: {
        name: reporterName.trim(),
        email: reporterEmail.trim(),
        phone: reporterPhone.trim(),
      },
      serviceHistory: [],
      isRecurring: false,
      hypothesis: { symptom: "", subSystemAnalysis: [], likelyRootCause: "", confidence: "low" },
      priorWork: "",
      recommendedParts: [],
      requiredTools: [],
      media: capturedMedia.length > 0 ? capturedMedia : undefined,
    });
    navigate("/orders");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/orders")}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <TechLabel>New Request</TechLabel>
          <h1 className="font-serif italic text-xl text-foreground">Report an Issue</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-5">
        {/* ── 1. Media Capture ──────────────────────────────── */}
        <section className="relative rounded-sm overflow-hidden border border-white/5 bg-black aspect-[4/3]">
          <Webcam
            ref={webcamRef}
            audio={captureMode === "video"}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode }}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Camera flip */}
          <button
            onClick={() =>
              setFacingMode((f) => (f === "user" ? "environment" : "user"))
            }
            className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-foreground"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>

          {/* Mode + shutter controls */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col items-center gap-3">
            {/* Mode selector */}
            <div className="flex gap-2">
              {(["photo", "video"] as CaptureMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCaptureMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold rounded-sm border transition-colors ${
                    captureMode === mode
                      ? "border-accent text-accent bg-accent/10"
                      : "border-white/10 text-muted-foreground bg-white/5"
                  }`}
                >
                  {mode === "photo" ? <Camera className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                  {mode}
                </button>
              ))}
            </div>

            {/* Shutter button */}
            {captureMode === "photo" ? (
              <button
                onClick={capturePhoto}
                disabled={capturedMedia.length >= 3}
                className="w-14 h-14 rounded-full border-[3px] border-foreground flex items-center justify-center disabled:opacity-30"
              >
                <Circle className="w-10 h-10 fill-foreground text-foreground" />
              </button>
            ) : (
              <button
                onClick={isRecordingVideo ? stopRecording : startRecording}
                disabled={!isRecordingVideo && capturedMedia.length >= 3}
                className="w-14 h-14 rounded-full border-[3px] border-red-500 flex items-center justify-center disabled:opacity-30"
              >
                {isRecordingVideo ? (
                  <Square className="w-6 h-6 fill-red-500 text-red-500" />
                ) : (
                  <Circle className="w-10 h-10 fill-red-500 text-red-500" />
                )}
              </button>
            )}
          </div>
        </section>

        {/* Thumbnails */}
        {capturedMedia.length > 0 && (
          <div className="flex gap-2">
            {capturedMedia.map((src, i) => (
              <div
                key={i}
                className="relative w-20 h-20 rounded-sm overflow-hidden border border-white/10"
              >
                {src.startsWith("blob:") ? (
                  <video src={src} className="w-full h-full object-cover" />
                ) : (
                  <img src={src} alt="" className="w-full h-full object-cover" />
                )}
                <button
                  onClick={() => removeMedia(i)}
                  className="absolute top-0.5 right-0.5 p-0.5 bg-black/70 rounded-full"
                >
                  <X className="w-3 h-3 text-foreground" />
                </button>
              </div>
            ))}
            {capturedMedia.length < 3 && (
              <span className="text-[10px] text-muted-foreground self-end">
                {3 - capturedMedia.length} more
              </span>
            )}
          </div>
        )}

        {/* ── 2. Context Input ──────────────────────────────── */}
        <section>
          <TechLabel>Short Summary</TechLabel>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary of the issue"
            className="mt-1 w-full h-10 rounded-sm border border-white/10 bg-white/[0.02] px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          />

          <div className="mt-3">
            <TechLabel>Full Detail</TechLabel>
          </div>
          <div className="mt-2 flex gap-2">
            <textarea
              value={fullDetail}
              onChange={(e) => setFullDetail(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={3}
              className="flex-1 min-h-[80px] w-full rounded-sm border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent resize-none"
            />
            <button
              onClick={toggleMic}
              disabled={!voiceSupported}
              className={`shrink-0 self-start p-3 rounded-sm border transition-colors ${
                isMicActive
                  ? "border-red-500/50 bg-red-500/10 text-red-400"
                  : "border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground"
              } disabled:opacity-30`}
            >
              {isMicActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
          </div>
          {isMicActive && (
            <div className="mt-2 flex items-center gap-2 text-[10px] text-red-400 uppercase tracking-wider">
              <VoicePulse /> Listening…
            </div>
          )}
        </section>

        {/* ── 3. Details ───────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          {/* Customer */}
          <div>
            <TechLabel>Customer</TechLabel>
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Customer name"
              className="mt-1 w-full h-10 rounded-sm border border-white/10 bg-white/[0.02] px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            />
          </div>

          {/* System type */}
          <div>
            <TechLabel>System</TechLabel>
            <div className="mt-1 flex gap-2">
              {SYSTEMS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSystem(s)}
                  className={`flex-1 py-2 text-[11px] uppercase tracking-wider font-semibold border rounded-sm transition-colors ${
                    system === s
                      ? "border-accent text-accent bg-accent/5"
                      : "border-white/5 text-muted-foreground bg-white/[0.02] hover:border-white/10"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* OEM */}
          <div>
            <TechLabel>OEM Brand</TechLabel>
            <div className="mt-1 flex gap-2">
              {OEMS.map((o) => (
                <button
                  key={o}
                  onClick={() => setOemBrand(o)}
                  className={`flex-1 py-2 text-[11px] uppercase tracking-wider font-semibold border rounded-sm transition-colors ${
                    oemBrand === o
                      ? "border-accent text-accent bg-accent/5"
                      : "border-white/5 text-muted-foreground bg-white/[0.02] hover:border-white/10"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <TechLabel>Location</TechLabel>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Site address"
              className="mt-1 w-full h-10 rounded-sm border border-white/10 bg-white/[0.02] px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            />
          </div>

          {/* Location detail */}
          <div>
            <TechLabel>Location Detail</TechLabel>
            <input
              value={locationDetail}
              onChange={(e) => setLocationDetail(e.target.value)}
              placeholder="Floor, room, zone"
              className="mt-1 w-full h-10 rounded-sm border border-white/10 bg-white/[0.02] px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            />
          </div>

          {/* Reporter section */}
          <div>
            <TechLabel>Reporter Name</TechLabel>
            <input
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="Who reported this issue?"
              className="mt-1 w-full h-10 rounded-sm border border-white/10 bg-white/[0.02] px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            />
          </div>
          <div>
            <TechLabel>Reporter Email</TechLabel>
            <input
              value={reporterEmail}
              onChange={(e) => setReporterEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              className="mt-1 w-full h-10 rounded-sm border border-white/10 bg-white/[0.02] px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            />
          </div>
          <div>
            <TechLabel>Reporter Phone</TechLabel>
            <input
              value={reporterPhone}
              onChange={(e) => setReporterPhone(e.target.value)}
              placeholder="Phone number"
              type="tel"
              className="mt-1 w-full h-10 rounded-sm border border-white/10 bg-white/[0.02] px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            />
          </div>
        </section>

        {/* Submit */}
        <BeamButton onClick={handleSubmit} disabled={!canSubmit}>
          Submit Request
        </BeamButton>
      </div>
    </div>
  );
};

export default NewServiceRequest;
