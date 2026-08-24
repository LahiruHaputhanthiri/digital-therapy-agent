'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useStressStore } from '@/store/useStressStore';

export interface MediaDeviceStatus {
  cameraActive: boolean;
  micActive: boolean;
  cameraError: string | null;
  micError: string | null;
  isAudioRecording: boolean;
  audioVolume: number; // 0 - 100 for visual waveform
  recordingDuration: number;
}

export function useMediaDevices() {
  const isCameraEnabled = useStressStore((state) => state.activeModalities.video);
  const isMicEnabled = useStressStore((state) => state.activeModalities.audio);
  const setModality = useStressStore((state) => state.setModality);

  const [status, setStatus] = useState<MediaDeviceStatus>({
    cameraActive: false,
    micActive: false,
    cameraError: null,
    micError: null,
    isAudioRecording: false,
    audioVolume: 0,
    recordingDuration: 0,
  });

  const videoStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Stops video stream tracks cleanly
   */
  const stopCameraStream = useCallback(() => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
    if (videoElementRef.current) {
      videoElementRef.current.srcObject = null;
    }
    setStatus((s) => ({ ...s, cameraActive: false, cameraError: null }));
  }, []);

  /**
   * Stops audio stream tracks and analysis cleanly
   */
  const stopAudioStream = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore closed error
      }
      audioContextRef.current = null;
    }
    setStatus((s) => ({
      ...s,
      micActive: false,
      isAudioRecording: false,
      audioVolume: 0,
      recordingDuration: 0,
      micError: null,
    }));
  }, []);

  /**
   * Starts camera on explicit user command
   */
  const startCamera = useCallback(async () => {
    try {
      stopCameraStream();
      setStatus((s) => ({ ...s, cameraError: null }));

      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Media devices API is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
        audio: false,
      });

      videoStreamRef.current = stream;
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = stream;
      }

      setModality('video', true);
      setStatus((s) => ({ ...s, cameraActive: true, cameraError: null }));
    } catch (err: unknown) {
      const errorMsg =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow access in browser settings.'
          : err instanceof Error
          ? err.message
          : 'Could not access camera device.';

      setModality('video', false);
      setStatus((s) => ({ ...s, cameraActive: false, cameraError: errorMsg }));
    }
  }, [setModality, stopCameraStream]);

  /**
   * Toggles camera stream
   */
  const toggleCamera = useCallback(async () => {
    if (status.cameraActive) {
      stopCameraStream();
      setModality('video', false);
    } else {
      await startCamera();
    }
  }, [status.cameraActive, startCamera, stopCameraStream, setModality]);

  /**
   * Starts audio recording and volume analysis on explicit user command
   */
  const startAudioRecording = useCallback(async () => {
    try {
      stopAudioStream();
      setStatus((s) => ({ ...s, micError: null, recordingDuration: 0 }));

      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Microphone API is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioStreamRef.current = stream;

      // Audio analysis for real-time waveform
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 255) * 120));
        setStatus((s) => ({ ...s, audioVolume: normalized }));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      animFrameRef.current = requestAnimationFrame(updateVolume);

      // Duration counter
      recordingTimerRef.current = setInterval(() => {
        setStatus((s) => ({ ...s, recordingDuration: s.recordingDuration + 1 }));
      }, 1000);

      setModality('audio', true);
      setStatus((s) => ({
        ...s,
        micActive: true,
        isAudioRecording: true,
        micError: null,
      }));
    } catch (err: unknown) {
      const errorMsg =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow access in browser settings.'
          : err instanceof Error
          ? err.message
          : 'Could not access microphone.';

      setModality('audio', false);
      setStatus((s) => ({
        ...s,
        micActive: false,
        isAudioRecording: false,
        micError: errorMsg,
      }));
    }
  }, [setModality, stopAudioStream]);

  /**
   * Stops audio recording
   */
  const stopAudioRecording = useCallback(() => {
    stopAudioStream();
    setModality('audio', false);
  }, [stopAudioStream, setModality]);

  // Synchronize with store modality changes (e.g. if disabled from settings)
  useEffect(() => {
    if (!isCameraEnabled && status.cameraActive) {
      stopCameraStream();
    }
  }, [isCameraEnabled, status.cameraActive, stopCameraStream]);

  useEffect(() => {
    if (!isMicEnabled && status.micActive) {
      stopAudioStream();
    }
  }, [isMicEnabled, status.micActive, stopAudioStream]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
      stopAudioStream();
    };
  }, [stopCameraStream, stopAudioStream]);

  return {
    status,
    videoElementRef,
    startCamera,
    stopCameraStream,
    toggleCamera,
    startAudioRecording,
    stopAudioRecording,
  };
}
