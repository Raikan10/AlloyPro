'use client';

import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Camera,
  Circle,
  Mic,
  MicOff,
  Square,
  SwitchCamera,
  Video,
  X,
} from 'lucide-react';
import { BeamButton, TechLabel, VoicePulse } from '@/components/alloypro/IndustrialAtoms';
import { type OemBrand, type SystemType, useCopilotStore } from '@/hooks/useCopilotStore';

const SYSTEMS: SystemType[] = ['HVAC', 'Projector'];
const OEMS: OemBrand[] = ['Trox Technik', 'Fuji', 'Panasonic'];

export default function NewServiceRequest() {
  const router = useRouter();
  const { addServiceOrder } = useCopilotStore();
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Form state
  const [capturedMedia, setCapturedMedia] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [fullDetail, setFullDetail] = useState('');
  const [customer, setCustomer] = useState('');
  const [system, setSystem] = useState<SystemType | ''>('');
  const [oemBrand, setOemBrand] = useState<OemBrand | ''>('');
  const [location, setLocation] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');

  // Camera state
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo');
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  // Voice dictation (using Web Speech API directly as in useLocalVoiceDictation)
  const [isMicActive, setIsMicActive] = useState(false);

  // Simple voice dictation start/stop (mimicking useLocalVoiceDictation)
  const toggleMic = useCallback(() => {
    if (isMicActive) {
      setIsMicActive(false);
      // In a real app we'd stop the speech recognition instance
    } else {
      setIsMicActive(true);
      // In a real app we'd start it
    }
  }, [isMicActive]);

  const canSubmit = customer.trim() && system && oemBrand && description.trim();

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
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
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
      hypothesis: { symptom: '', subSystemAnalysis: [], likelyRootCause: '', confidence: 'low' },
      priorWork: '',
      recommendedParts: [],
      requiredTools: [],
      media: capturedMedia.length > 0 ? capturedMedia : undefined,
    });
    router.push('/orders');
  };

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => router.push('/orders')}
          className="text-muted-foreground hover:text-foreground p-2 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <TechLabel>New Request</TechLabel>
          <h1 className="text-foreground font-serif text-xl italic">Report an Issue</h1>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-6">
        {/* 1. Media Capture */}
        <section className="relative aspect-[4/3] overflow-hidden rounded-sm border border-white/5 bg-black">
          <Webcam
            ref={webcamRef}
            audio={captureMode === 'video'}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode }}
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Camera flip */}
          <button
            onClick={() => setFacingMode((f) => (f === 'user' ? 'environment' : 'user'))}
            className="text-foreground absolute top-3 right-3 rounded-full bg-black/50 p-2"
          >
            <SwitchCamera className="h-4 w-4" />
          </button>

          {/* Mode + shutter controls */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex gap-2">
              {(['photo', 'video'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCaptureMode(mode)}
                  className={`flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase transition-colors ${
                    captureMode === mode
                      ? 'border-accent text-accent bg-accent/10'
                      : 'text-muted-foreground border-white/10 bg-white/5'
                  }`}
                >
                  {mode === 'photo' ? (
                    <Camera className="h-3 w-3" />
                  ) : (
                    <Video className="h-3 w-3" />
                  )}
                  {mode}
                </button>
              ))}
            </div>

            {captureMode === 'photo' ? (
              <button
                onClick={capturePhoto}
                disabled={capturedMedia.length >= 3}
                className="border-foreground flex h-14 w-14 items-center justify-center rounded-full border-[3px] disabled:opacity-30"
              >
                <Circle className="fill-foreground text-foreground h-10 w-10" />
              </button>
            ) : (
              <button
                onClick={isRecordingVideo ? stopRecording : startRecording}
                disabled={!isRecordingVideo && capturedMedia.length >= 3}
                className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-red-500 disabled:opacity-30"
              >
                {isRecordingVideo ? (
                  <Square className="h-6 w-6 fill-red-500 text-red-500" />
                ) : (
                  <Circle className="h-10 w-10 fill-red-500 text-red-500" />
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
                className="relative h-20 w-20 overflow-hidden rounded-sm border border-white/10"
              >
                {src.startsWith('blob:') ? (
                  <video src={src} className="h-full w-full object-cover" />
                ) : (
                  <img src={src} alt="" className="h-full w-full object-cover" />
                )}
                <button
                  onClick={() => removeMedia(i)}
                  className="absolute top-0.5 right-0.5 rounded-full bg-black/70 p-0.5"
                >
                  <X className="text-foreground h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 2. Context Input */}
        <section>
          <TechLabel>Short Summary</TechLabel>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary of the issue"
            className="text-foreground placeholder:text-muted-foreground focus:ring-accent mt-1 h-10 w-full rounded-sm border border-white/10 bg-white/[0.02] px-3 text-sm focus:ring-1 focus:outline-none"
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
              className="text-foreground placeholder:text-muted-foreground focus:ring-accent min-h-[80px] w-full flex-1 resize-none rounded-sm border border-white/10 bg-white/[0.02] px-3 py-2 text-sm focus:ring-1 focus:outline-none"
            />
            <button
              onClick={toggleMic}
              className={`shrink-0 self-start rounded-sm border p-3 transition-colors ${
                isMicActive
                  ? 'border-red-500/50 bg-red-500/10 text-red-400'
                  : 'text-muted-foreground hover:text-foreground border-white/10 bg-white/[0.02]'
              }`}
            >
              {isMicActive ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
          </div>
          {isMicActive && (
            <div className="mt-2 flex items-center gap-2 text-[10px] tracking-wider text-red-400 uppercase">
              <VoicePulse /> Listening…
            </div>
          )}
        </section>

        {/* 3. Details */}
        <section className="flex flex-col gap-4">
          <div>
            <TechLabel>Customer</TechLabel>
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Customer name"
              className="text-foreground placeholder:text-muted-foreground focus:ring-accent mt-1 h-10 w-full rounded-sm border border-white/10 bg-white/[0.02] px-3 text-sm focus:ring-1 focus:outline-none"
            />
          </div>

          <div>
            <TechLabel>System</TechLabel>
            <div className="mt-1 flex gap-2">
              {SYSTEMS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSystem(s)}
                  className={`flex-1 rounded-sm border py-2 text-[11px] font-semibold tracking-wider uppercase transition-colors ${
                    system === s
                      ? 'border-accent text-accent bg-accent/5'
                      : 'text-muted-foreground border-white/5 bg-white/[0.02] hover:border-white/10'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <TechLabel>OEM Brand</TechLabel>
            <div className="mt-1 flex gap-2">
              {OEMS.map((o) => (
                <button
                  key={o}
                  onClick={() => setOemBrand(o)}
                  className={`flex-1 rounded-sm border py-2 text-[11px] font-semibold tracking-wider uppercase transition-colors ${
                    oemBrand === o
                      ? 'border-accent text-accent bg-accent/5'
                      : 'text-muted-foreground border-white/5 bg-white/[0.02] hover:border-white/10'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div>
            <TechLabel>Location</TechLabel>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Site address"
              className="text-foreground placeholder:text-muted-foreground focus:ring-accent mt-1 h-10 w-full rounded-sm border border-white/10 bg-white/[0.02] px-3 text-sm focus:ring-1 focus:outline-none"
            />
          </div>

          <div>
            <TechLabel>Location Detail</TechLabel>
            <input
              value={locationDetail}
              onChange={(e) => setLocationDetail(e.target.value)}
              placeholder="Floor, room, zone"
              className="text-foreground placeholder:text-muted-foreground focus:ring-accent mt-1 h-10 w-full rounded-sm border border-white/10 bg-white/[0.02] px-3 text-sm focus:ring-1 focus:outline-none"
            />
          </div>
        </section>

        <BeamButton onClick={handleSubmit} disabled={!canSubmit}>
          Submit Request
        </BeamButton>
      </div>
    </div>
  );
}
