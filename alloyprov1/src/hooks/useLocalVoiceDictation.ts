import { useState, useRef, useCallback, useEffect } from "react";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
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

interface UseLocalVoiceDictationOptions {
  onTranscript: (text: string) => void;
}

export function useLocalVoiceDictation({ onTranscript }: UseLocalVoiceDictationOptions) {
  const [isMicActive, setIsMicActive] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isRunningRef = useRef(false);
  const isMicActiveRef = useRef(false);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

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
          if (text) onTranscript(text);
        }
      }
    };

    recognition.onend = () => {
      isRunningRef.current = false;
      if (isMicActiveRef.current) {
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
  }, [isSupported, onTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
      isRunningRef.current = false;
    }
  }, []);

  const toggleMic = useCallback(() => {
    setIsMicActive((prev) => {
      const next = !prev;
      isMicActiveRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    if (isMicActive) {
      startListening();
    } else {
      stopListening();
    }
    return () => stopListening();
  }, [isMicActive, startListening, stopListening]);

  return { isMicActive, toggleMic, isSupported };
}
