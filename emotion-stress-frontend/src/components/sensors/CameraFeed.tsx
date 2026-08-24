'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  CameraOff,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ScanFace,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMediaDevices } from '@/hooks/useMediaDevices';
import { SensorConsentDialog } from '@/components/sensors/SensorConsentDialog';
import { cn } from '@/lib/utils';
import { useStressStore } from '@/store/useStressStore';

/**
 * CameraFeed Component - Phase 3 Sensory Feeds
 * Manages video feed preview, real-time facial landmark status overlay,
 * mirror rendering, privacy blur toggle, and graceful fallback when camera is inactive.
 */
export function CameraFeed() {
  const { status, videoElementRef, startCamera, stopCameraStream } = useMediaDevices();
  const [isBlurred, setIsBlurred] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const privacyConsent = useStressStore((state) => state.privacyConsent);
  const updatePrivacyConsent = useStressStore((state) => state.updatePrivacyConsent);

  const handleToggle = () => {
    if (status.cameraActive) {
      stopCameraStream();
    } else {
      if (!privacyConsent.allowCamera) {
        setShowConsent(true);
      } else {
        startCamera();
      }
    }
  };

  const handleConsentApproved = () => {
    updatePrivacyConsent({ allowCamera: true });
    startCamera();
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Header & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Facial Signals Preview
          </span>
        </div>
        <Badge variant={status.cameraActive ? 'accent' : 'secondary'}>
          {status.cameraActive ? 'Tracking Active' : 'Camera Off'}
        </Badge>
      </div>

      {/* Video Viewport / Privacy Screen */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-900 dark:border-slate-800 flex items-center justify-center shadow-inner">
        {/* Raw Video Feed with CSS Mirror & Blur Effects */}
        <video
          ref={videoElementRef}
          autoPlay
          playsInline
          muted
          aria-label="Local Camera Stream Preview"
          className={cn(
            'h-full w-full object-cover scale-x-[-1] transition-all duration-300',
            status.cameraActive ? 'opacity-100' : 'opacity-0 hidden',
            isBlurred && 'blur-lg scale-105'
          )}
        />

        {/* Missing-Modality Fallback Screen */}
        {!status.cameraActive && (
          <div className="flex flex-col items-center justify-center p-4 text-center select-none">
            <div className="rounded-2xl bg-slate-800/90 p-3.5 text-slate-400 mb-2 border border-slate-700/60 shadow-xs">
              <CameraOff className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold text-slate-200">
              Camera Feed Inactive
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[210px] leading-tight">
              Facial emotion estimation is paused. Your session continues in text/audio privacy mode.
            </p>
          </div>
        )}

        {/* Privacy Blur Overlay Action Button (When Active) */}
        {status.cameraActive && (
          <div className="absolute top-2.5 right-2.5 flex gap-1.5 z-10">
            <button
              type="button"
              onClick={() => setIsBlurred(!isBlurred)}
              title={isBlurred ? 'Remove privacy blur' : 'Apply privacy blur overlay'}
              aria-label={isBlurred ? 'Remove privacy blur' : 'Apply privacy blur overlay'}
              className="rounded-xl bg-black/65 backdrop-blur-md px-2 py-1.5 text-xs text-white hover:bg-black/85 transition-colors flex items-center gap-1 shadow-sm border border-white/10"
            >
              {isBlurred ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-[10px]">Blurred</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  <span className="text-[10px]">Blur</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Facial Landmark Tracking Status Overlay (When Active) */}
        {status.cameraActive && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] text-teal-300 border border-teal-500/30"
          >
            <ScanFace className="h-3.5 w-3.5 text-teal-400 animate-pulse" />
            <span>Landmarks Aligned (Local)</span>
          </motion.div>
        )}
      </div>

      {/* Camera Error Message Alert */}
      {status.cameraError && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="text-[11px] leading-tight">{status.cameraError}</span>
        </div>
      )}

      {/* Control Toggle Button */}
      <div className="pt-0.5">
        <Button
          type="button"
          size="sm"
          variant={status.cameraActive ? 'destructive' : 'outline'}
          onClick={handleToggle}
          className="w-full justify-center gap-2 text-xs rounded-xl"
        >
          {status.cameraActive ? (
            <>
              <CameraOff className="h-3.5 w-3.5" />
              Disable Camera Feed
            </>
          ) : (
            <>
              <Camera className="h-3.5 w-3.5 text-blue-500" />
              Enable Camera Preview
            </>
          )}
        </Button>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
        <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <span>Camera frames are processed in-memory for facial cues. Raw video is never recorded or stored.</span>
      </div>

      {/* Explicit Consent Request Dialog */}
      <SensorConsentDialog
        open={showConsent}
        onOpenChange={setShowConsent}
        sensorType="camera"
        onConsent={handleConsentApproved}
        onDecline={() => setShowConsent(false)}
      />
    </div>
  );
}
