"use client";

import { useCallback } from "react";
import { useSpeechToText } from "@/hooks/useSpeechToText";

type VoiceTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  required?: boolean;
};

export default function VoiceTextarea({
  value,
  onChange,
  rows = 6,
  placeholder,
  required,
}: VoiceTextareaProps) {
  const handleResult = useCallback(
    (text: string) => {
      onChange(value ? `${value.trim()} ${text}` : text);
    },
    [value, onChange]
  );

  const { isSupported, isListening, start, stop } = useSpeechToText(handleResult);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <textarea
          required={required}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-amber-200 rounded-lg px-4 py-3 pr-14 text-base text-stone-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        {isSupported && (
          <button
            type="button"
            onClick={isListening ? stop : start}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            title={isListening ? "Stop voice input" : "Speak instead of typing"}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isListening
                ? "bg-red-600 text-white animate-pulse"
                : "bg-amber-100 text-amber-800 hover:bg-amber-200"
            }`}
          >
            🎤
          </button>
        )}
      </div>
      {!isSupported && (
        <p className="text-xs text-stone-400">
          Voice input isn&apos;t available in this browser — please type instead.
        </p>
      )}
      {isListening && (
        <p className="text-xs text-amber-700">Listening... speak your answer, then click the mic to stop.</p>
      )}
    </div>
  );
}
