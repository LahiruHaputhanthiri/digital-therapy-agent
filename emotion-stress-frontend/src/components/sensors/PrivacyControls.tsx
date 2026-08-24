'use client';

import React from 'react';
import { Camera, Mic, Keyboard, Shield, ShieldAlert, ShieldCheck, Info, PowerOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStressStore } from '@/store/useStressStore';

/**
 * PrivacyControls Component - Phase 3 Sensory Feeds
 * Provides granular hardware controls for video, audio, and keystroke modalities,
 * status indicators, and an instant "Maximum Privacy Mode" kill switch.
 */
export function PrivacyControls() {
  const activeModalities = useStressStore((state) => state.activeModalities);
  const setModality = useStressStore((state) => state.setModality);
  const privacyConsent = useStressStore((state) => state.privacyConsent);
  const updatePrivacyConsent = useStressStore((state) => state.updatePrivacyConsent);

  const activeSensorsCount = Object.entries(activeModalities).filter(
    ([key, active]) => active && key !== 'text' && key !== 'history'
  ).length;

  /**
   * One-click Maximum Privacy Action
   * Instantly kills camera, microphone, and keystroke telemetry.
   */
  const handleEnableMaxPrivacy = () => {
    setModality('video', false);
    setModality('audio', false);
    setModality('keystroke', false);
    updatePrivacyConsent({
      allowCamera: false,
      allowMicrophone: false,
      allowKeystrokeAnalysis: false,
    });
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <CardTitle className="text-sm font-semibold">Sensor Privacy & Controls</CardTitle>
          </div>
          <Badge variant={activeSensorsCount === 0 ? 'secondary' : 'accent'}>
            {activeSensorsCount === 0 ? 'Privacy Mode' : `${activeSensorsCount} Active`}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3.5 text-xs">
        {/* 1. Camera Switch */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-blue-100 dark:bg-blue-950/80 p-2 text-blue-600 dark:text-blue-400">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Facial Video Signals</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {activeModalities.video ? 'Streaming local frames' : 'Camera Off (Zero capture)'}
              </p>
            </div>
          </div>
          <Switch
            checked={activeModalities.video}
            onCheckedChange={(checked) => setModality('video', checked)}
            aria-label="Toggle camera video modality"
          />
        </div>

        {/* 2. Microphone Switch */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-teal-100 dark:bg-teal-950/80 p-2 text-teal-600 dark:text-teal-400">
              <Mic className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Audio Tone Signals</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {activeModalities.audio ? 'Microphone enabled' : 'Microphone Off'}
              </p>
            </div>
          </div>
          <Switch
            checked={activeModalities.audio}
            onCheckedChange={(checked) => setModality('audio', checked)}
            aria-label="Toggle audio microphone modality"
          />
        </div>

        {/* 3. Keystroke Dynamics Switch */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-purple-100 dark:bg-purple-950/80 p-2 text-purple-600 dark:text-purple-400">
              <Keyboard className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Keystroke Dynamics</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {activeModalities.keystroke ? 'Dwell & cadence timing only' : 'Disabled'}
              </p>
            </div>
          </div>
          <Switch
            checked={activeModalities.keystroke}
            onCheckedChange={(checked) => setModality('keystroke', checked)}
            aria-label="Toggle keystroke dynamics tracking"
          />
        </div>

        {/* Maximum Privacy Mode Instant Kill Switch */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleEnableMaxPrivacy}
          disabled={activeSensorsCount === 0}
          className="w-full justify-center gap-2 rounded-xl text-xs border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <PowerOff className="h-3.5 w-3.5 text-rose-500" />
          Set Maximum Privacy (Disable All Sensors)
        </Button>

        {/* Missing Modality Info Box (When Privacy Mode Active) */}
        {activeSensorsCount === 0 && (
          <div className="flex items-start gap-2 rounded-xl bg-blue-50/80 p-2.5 text-[11px] text-blue-900 dark:bg-blue-950/60 dark:text-blue-200 border border-blue-100 dark:border-blue-900/60">
            <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Privacy Mode Active</p>
              <p className="mt-0.5 text-blue-800/90 dark:text-blue-200/90">
                All physical sensors are disconnected. The assistant functions smoothly in conversation mode.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
