'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Camera, CameraOff, ShieldCheck } from 'lucide-react';
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
 * InputBar - Phase 4 Chat Interface with Bilingual Support
 * Multi-line auto-expanding textarea connected to:
 * - `useKeystrokeTracker` for behavioral rhythm sampling (zero character logging)
 * - `useMediaDevices` for camera and microphone quick-toggles
 * - Consent dialogs for first-time sensor activation
 * - Full English / Sinhala localized UI strings
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
      className="relative flex flex-col gap-0 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md overflow-hidden"
      role="region"
      aria-label={t.chat.inputPlaceholder}
    >
      {/* Main Input Row */}
      <div className="flex items-end gap-2 px-2.5 sm:px-3 pt-2.5 pb-2">
        {/* Sensor Quick-Toggle Buttons */}
        <div className="flex items-center gap-1 pb-0.5">
          {/* Camera Toggle */}
          <button
            type="button"
            onClick={handleCameraToggle}
            title={mediaStatus.cameraActive ? t.chat.disableCamera : t.chat.enableCamera}
            aria-label={mediaStatus.cameraActive ? t.chat.disableCamera : t.chat.enableCamera}
            aria-pressed={mediaStatus.cameraActive}
            className={`p-2 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer ${
              mediaStatus.cameraActive
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
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
            className="w-full resize-none bg-transparent py-2 px-1 text-sm text-slate-800 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500 focus:outline-none max-h-28 scrollbar-thin"
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
            className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-xs transition-all cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Privacy Notice Footer */}
      <div className="flex items-center justify-between px-3.5 pb-2.5 text-[10px] text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-1.5 min-w-0 pr-2">
          <ShieldCheck className="h-3 w-3 text-teal-600 dark:text-teal-400 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {isKeystrokeActive
              ? t.chat.keystrokeActiveNotice
              : t.chat.textOnlyNotice}
          </span>
        </div>
        <span className="hidden sm:inline text-slate-400/70 shrink-0">{t.chat.shiftEnterHint}</span>
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
