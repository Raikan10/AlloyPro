import { useEffect, useRef, useCallback } from "react";
import { useCopilotStore } from "@/store/useCopilotStore";

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export function useVoiceDictation() {
  const { isMicActive, toggleMic, appendTranscript } = useCopilotStore();
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isRunningRef = useRef(false);

  const isSupported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!isSupported || isRunningRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const text = event.results[i][0].transcript.trim();
          if (text) appendTranscript(text);
        }
      }
    };

    recognition.onend = () => {
      isRunningRef.current = false;
      // Restart if mic is still supposed to be active
      if (useCopilotStore.getState().isMicActive) {
        try {
          recognition.start();
          isRunningRef.current = true;
        } catch {
          // ignore
        }
      }
    };

    recognition.onerror = () => {
      isRunningRef.current = false;
    };

    try {
      recognition.start();
      isRunningRef.current = true;
      recognitionRef.current = recognition;
    } catch {
      // ignore
    }
  }, [isSupported, appendTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
      isRunningRef.current = false;
    }
  }, []);

  // Sync with store's isMicActive
  useEffect(() => {
    if (isMicActive) {
      startListening();
    } else {
      stopListening();
    }
    return () => stopListening();
  }, [isMicActive, startListening, stopListening]);

  return { isSupported, isMicActive, toggleMic };
}
