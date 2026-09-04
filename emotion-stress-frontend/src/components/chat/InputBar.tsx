'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Camera, CameraOff, ShieldCheck, Sparkles, Mic, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioRecorder } from '@/components/sensors/AudioRecorder';
import { SensorConsentDialog } from '@/components/sensors/SensorConsentDialog';
import { useKeystrokeTracker } from '@/hooks/useKeystrokeTracker';
import { useMediaDevices } from '@/hooks/useMediaDevices';
import { useStressStore } from '@/store/useStressStore';
import { useTranslation } from '@/locales';
import { stopTTS } from '@/utils/tts';

export interface InputBarProps {
  /** Called with the message text (and optional audio metrics) when the user submits. */
  onSendMessage: (
    text: string,
    audioMetrics?: { audio?: string; volumeDb: number; recordingDurationSeconds: number }
  ) => void;
  /** Disables input while the AI is generating a response. */
  disabled?: boolean;
}

/**
 * InputBar — Multimodal Interaction Dock.
 *
 * Modernized focus-first input dock with:
 * - Direct camera / microphone toggles with animated status pills
 * - `useKeystrokeTracker` behavioral rhythm sampling (zero character logging)
 * - Auto-resizing textarea with Enter-to-send support
 * - First-time sensor consent handling & privacy indicators
 */
export function InputBar({ onSendMessage, disabled }: InputBarProps) {
  const [inputText, setInputText] = useState('');
  const [showCameraConsent, setShowCameraConsent] = useState(false);
  const [showMicConsent, setShowMicConsent] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { t } = useTranslation();
  const { handleKeyDown, handleKeyUp, resetMetrics } = useKeystrokeTracker();
  const {
    status: mediaStatus,
    startCamera,
    stopCameraStream,
    startAudioRecording,
    stopAudioRecording,
  } = useMediaDevices();

  const isKeystrokeActive = useStressStore((state) => state.activeModalities.keystroke);
  const privacyConsent = useStressStore((state) => state.privacyConsent);
  const updatePrivacyConsent = useStressStore((state) => state.updatePrivacyConsent);

  // Auto-resize textarea to content (max ~120px / ~5 lines)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    if (!inputText.trim() || disabled) return;

    // Immediately stop any active AI therapist speech
    stopTTS();

    onSendMessage(inputText.trim());
    setInputText('');
    resetMetrics();

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  /** Composite KeyDown handler: forwards to keystroke tracker + handles Enter-to-send */
  const handleKeyDownComposite = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleKeyDown(e);

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCameraToggle = () => {
    if (mediaStatus.cameraActive) {
      stopCameraStream();
    } else {
      if (!privacyConsent.allowCamera) {
        setShowCameraConsent(true);
      } else {
        startCamera();
      }
    }
  };

  /** Called when user finishes a voice message — packages audio payload and sends */
  const handleAudioComplete = async () => {
    const result = await stopAudioRecording();
    if (!result.base64Audio) return;

    const duration = result.duration || mediaStatus.recordingDuration;
    const volume = result.volume || mediaStatus.audioVolume;

    onSendMessage('', {
      audio: result.base64Audio,
      volumeDb: volume,
      recordingDurationSeconds: duration,
    });
  };

  const handleAudioStart = () => {
    // Critical UX requirement: Immediately cancel AI speech when user taps microphone
    stopTTS();

    if (!privacyConsent.allowMicrophone) {
      setShowMicConsent(true);
    } else {
      startAudioRecording((result) => {
        // Automatic silence auto-stop handler
        if (result.base64Audio) {
          const duration = result.duration || mediaStatus.recordingDuration;
          const volume = result.volume || mediaStatus.audioVolume;
          onSendMessage('', {
            audio: result.base64Audio,
            volumeDb: volume,
            recordingDurationSeconds: duration,
          });
        }
      });
    }
  };

  return (
    <div
      className="relative flex flex-col gap-0 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden transition-all"
      role="region"
      aria-label={t.chat.inputPlaceholder}
    >
      {/* Sensor Status Indicator Bar */}
      <div className="flex items-center justify-between px-4 pt-2.5 pb-1 text-[11px]">
        <div className="flex items-center gap-2">
          {mediaStatus.cameraActive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/60 dark:border-blue-800/60">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              Camera Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 font-medium">
              <CameraOff className="h-3 w-3" />
              Camera Off
            </span>
          )}

          {mediaStatus.isAudioRecording ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200/60 dark:border-teal-800/60">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-ping" />
              Voice Recording
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 font-medium">
              <Mic className="h-3 w-3" />
              Voice Ready
            </span>
          )}

          {isKeystrokeActive && (
            <span className="hidden sm:inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
              <Keyboard className="h-3 w-3" />
              Typing Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="hidden md:inline text-[10px]">Private Local Processing</span>
        </div>
      </div>

      {/* Main Input Row */}
      <div className="flex items-end gap-2.5 px-3 sm:px-4 pt-1.5 pb-3">
        {/* Sensor Quick-Toggle Buttons */}
        <div className="flex items-center gap-1 pb-0.5">
          {/* Camera Toggle */}
          <button
            type="button"
            onClick={handleCameraToggle}
            title={mediaStatus.cameraActive ? t.chat.disableCamera : t.chat.enableCamera}
            aria-label={mediaStatus.cameraActive ? t.chat.disableCamera : t.chat.enableCamera}
            aria-pressed={mediaStatus.cameraActive}
            className={`p-2.5 rounded-2xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 cursor-pointer ${
              mediaStatus.cameraActive
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300'
            }`}
          >
            {mediaStatus.cameraActive ? (
              <Camera className="h-4 w-4" />
            ) : (
              <CameraOff className="h-4 w-4" />
            )}
          </button>

          {/* Audio Recorder with animated waveform & silence auto-stop */}
          <AudioRecorder
            isRecording={mediaStatus.isAudioRecording}
            isFinishing={mediaStatus.isSilenceFinishing}
            recordingDuration={mediaStatus.recordingDuration}
            audioVolume={mediaStatus.audioVolume}
            onStart={handleAudioStart}
            onStop={handleAudioComplete}
            onCancel={stopAudioRecording}
          />
        </div>

        {/* Auto-resizing Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            id="chat-input"
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDownComposite}
            onKeyUp={handleKeyUp}
            placeholder={
              mediaStatus.isAudioRecording
                ? t.chat.inputListening
                : t.chat.inputPlaceholder
            }
            disabled={disabled || mediaStatus.isAudioRecording}
            aria-label={t.chat.inputPlaceholder}
            aria-multiline="true"
            className="w-full resize-none bg-transparent py-2.5 px-2 text-sm text-slate-900 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500 focus:outline-none max-h-28 scrollbar-thin font-medium"
          />
        </div>

        {/* Send Button */}
        <div className="pb-0.5">
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={!inputText.trim() || disabled || mediaStatus.isAudioRecording}
            aria-label={t.chat.sendMessage}
            className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 disabled:opacity-40 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Consent Dialogs */}
      <SensorConsentDialog
        open={showCameraConsent}
        onOpenChange={setShowCameraConsent}
        sensorType="camera"
        onConsent={() => {
          updatePrivacyConsent({ allowCamera: true });
          startCamera();
        }}
        onDecline={() => setShowCameraConsent(false)}
      />

      <SensorConsentDialog
        open={showMicConsent}
        onOpenChange={setShowMicConsent}
        sensorType="microphone"
        onConsent={() => {
          updatePrivacyConsent({ allowMicrophone: true });
          startAudioRecording();
        }}
        onDecline={() => setShowMicConsent(false)}
      />
    </div>
  );
}
