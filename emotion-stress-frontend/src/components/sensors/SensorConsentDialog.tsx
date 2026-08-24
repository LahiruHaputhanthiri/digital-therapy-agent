'use client';

import React from 'react';
import { Camera, Mic, ShieldCheck, Lock } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface SensorConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sensorType: 'camera' | 'microphone';
  onConsent: () => void;
  onDecline: () => void;
}

export function SensorConsentDialog({
  open,
  onOpenChange,
  sensorType,
  onConsent,
  onDecline,
}: SensorConsentDialogProps) {
  const isCamera = sensorType === 'camera';
  const Icon = isCamera ? Camera : Mic;
  const title = isCamera ? 'Camera Access Request' : 'Microphone Access Request';

  const handleAllow = () => {
    onConsent();
    onOpenChange(false);
  };

  const handleDecline = () => {
    onDecline();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Optional multimodal signal estimation for your session."
      maxWidth="sm"
    >
      <div className="space-y-4 pt-1">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
          <div className="rounded-xl bg-blue-600 p-2.5 text-white shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {isCamera ? 'Facial Expression Signals' : 'Acoustic Voice Signals'}
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
              {isCamera
                ? 'Processed locally in real-time to estimate non-verbal facial tension. Raw video is never stored.'
                : 'Processed during voice messages to estimate tone and cadence. Audio is not recorded continuously.'}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <span>You can disable or blur the sensor at any time from privacy controls.</span>
          </div>
          <div className="flex items-start gap-2">
            <Lock className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <span>The assistant functions fully in text-only mode if you choose not to allow access.</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleDecline}
            className="rounded-xl text-xs"
          >
            Not Now
          </Button>
          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={handleAllow}
            className="rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            Allow {isCamera ? 'Camera' : 'Microphone'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
