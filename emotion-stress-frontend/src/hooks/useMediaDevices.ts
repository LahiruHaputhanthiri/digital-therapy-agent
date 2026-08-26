'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useStressStore } from '@/store/useStressStore';

export interface MediaDeviceStatus {
  cameraActive: boolean;
  micActive: boolean;
  cameraError: string | null;
  micError: string | null;
  isAudioRecording: boolean;
  isSilenceFinishing: boolean; // True when ~1.7s of silence elapsed and auto-stop is imminent
  audioVolume: number; // 0 - 100 for visual waveform
  recordingDuration: number;
}

export interface AudioRecordingResult {
  base64Audio?: string;
  volume: number;
  duration: number;
  speechDetected: boolean;
}

export const SILENCE_CONFIG = {
  SILENCE_DURATION_MS: 2500, // 2.5 seconds continuous silence for auto-stop
  INITIAL_GRACE_PERIOD_MS: 1000, // 1 second initial grace period before silence timer starts
  CALIBRATION_WINDOW_MS: 600, // First 600ms to measure background ambient floor
  DEFAULT_SILENCE_THRESHOLD: 0.018, // Minimum RMS threshold for speech detection
  FINISHING_INDICATOR_MS: 1700, // Show "Finishing..." state after 1.7s of silence
};

/**
 * Calculates Root Mean Square (RMS) volume from a Float32 time-domain buffer
 */
function calculateRMS(data: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i];
  }
  return Math.sqrt(sum / data.length);
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
    isSilenceFinishing: false,
    audioVolume: 0,
    recordingDuration: 0,
  });

  const videoStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Silence Detection & Ambient Calibration Refs
  const recordingStartTimeRef = useRef<number>(0);
  const silenceStartTimeRef = useRef<number | null>(null);
  const baselineNoiseRef = useRef<number>(SILENCE_CONFIG.DEFAULT_SILENCE_THRESHOLD);
  const hasSpokenRef = useRef<boolean>(false);
  const isStoppingRef = useRef<boolean>(false);
  const autoStopCallbackRef = useRef<((result: AudioRecordingResult) => void) | null>(null);

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
    analyserRef.current = null;
    silenceStartTimeRef.current = null;

    setStatus((s) => ({
      ...s,
      micActive: false,
      isAudioRecording: false,
      isSilenceFinishing: false,
      audioVolume: 0,
      recordingDuration: 0,
      micError: null,
    }));
  }, []);

  /**
   * Stops audio recording and returns recorded base64 WebM audio payload
   */
  const stopAudioRecording = useCallback(async (): Promise<AudioRecordingResult> => {
    if (isStoppingRef.current) {
      return {
        volume: 0,
        duration: 0,
        speechDetected: false,
      };
    }
    isStoppingRef.current = true;

    const finalVolume = status.audioVolume;
    const finalDuration = status.recordingDuration;
    const speechDetected = hasSpokenRef.current;

    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      const cleanupAndResolve = (base64Audio?: string) => {
        stopAudioStream();
        setModality('audio', false);
        isStoppingRef.current = false;
        resolve({
          base64Audio,
          volume: finalVolume,
          duration: finalDuration,
          speechDetected,
        });
      };

      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = () => {
          try {
            if (audioChunksRef.current.length === 0) {
              console.log('[useMediaDevices] No audio chunks captured. Discarding empty recording.');
              cleanupAndResolve(undefined);
              return;
            }

            const blob = new Blob(audioChunksRef.current, {
              type: recorder.mimeType || 'audio/webm',
            });

            if (blob.size < 100) {
              console.log(`[useMediaDevices] Captured audio blob size too small (${blob.size} bytes). Discarding.`);
              cleanupAndResolve(undefined);
              return;
            }

            console.log(`[useMediaDevices] Audio recording stopped. Blob size: ${blob.size} bytes | type: ${blob.type}`);
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Audio = reader.result as string;
              console.log(`[useMediaDevices] Base64 audio encoded. Data URL length: ${base64Audio?.length || 0}`);
              cleanupAndResolve(base64Audio);
            };
            reader.onerror = (err) => {
              console.warn('[useMediaDevices] FileReader error:', err);
              cleanupAndResolve(undefined);
            };
            reader.readAsDataURL(blob);
          } catch (blobErr) {
            console.warn('[useMediaDevices] Blob construction error:', blobErr);
            cleanupAndResolve(undefined);
          }
        };

        try {
          if (typeof recorder.requestData === 'function') {
            recorder.requestData();
          }
        } catch {
          // ignore if already closing
        }
        recorder.stop();
      } else {
        cleanupAndResolve(undefined);
      }
    });
  }, [status.audioVolume, status.recordingDuration, stopAudioStream, setModality]);

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
      setStatus((s) => ({
        ...s,
        cameraActive: true,
        cameraError: null,
      }));
    } catch (err: unknown) {
      const errorMsg =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow access in browser settings.'
          : err instanceof Error
          ? err.message
          : 'Could not access camera.';

      setModality('video', false);
      setStatus((s) => ({
        ...s,
        cameraActive: false,
        cameraError: errorMsg,
      }));
    }
  }, [setModality, stopCameraStream]);

  /**
   * Toggle camera helper
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
   * Starts audio recording with real-time volume analysis, ambient noise calibration,
   * and automatic silence stop after ~2.5 seconds.
   */
  const startAudioRecording = useCallback(
    async (onAutoStop?: (result: AudioRecordingResult) => void) => {
      try {
        stopAudioStream();
        isStoppingRef.current = false;
        hasSpokenRef.current = false;
        silenceStartTimeRef.current = null;
        recordingStartTimeRef.current = Date.now();
        baselineNoiseRef.current = SILENCE_CONFIG.DEFAULT_SILENCE_THRESHOLD;
        autoStopCallbackRef.current = onAutoStop || null;

        setStatus((s) => ({
          ...s,
          micError: null,
          recordingDuration: 0,
          isSilenceFinishing: false,
        }));

        if (!navigator?.mediaDevices?.getUserMedia) {
          throw new Error('Microphone API is not supported in this browser.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        audioStreamRef.current = stream;

        // 1. Initialize MediaRecorder for Base64 WebM audio capture
        try {
          let mimeType = 'audio/webm;codecs=opus';
          if (typeof MediaRecorder !== 'undefined') {
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
              mimeType = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/webm')) {
              mimeType = 'audio/webm';
            } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
              mimeType = 'audio/ogg';
            } else {
              mimeType = '';
            }
            const options = mimeType ? { mimeType } : undefined;
            const recorder = new MediaRecorder(stream, options);
            audioChunksRef.current = [];
            recorder.ondataavailable = (event) => {
              if (event.data && event.data.size > 0) {
                audioChunksRef.current.push(event.data);
              }
            };
            recorder.start(100);
            mediaRecorderRef.current = recorder;
          }
        } catch (recErr) {
          console.warn('[useMediaDevices] MediaRecorder setup notice:', recErr);
        }

        // 2. Audio Context & Analyser for Live Waveform & Silence Detection
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048; // High resolution for accurate time-domain RMS calculation
        const source = ctx.createMediaStreamSource(stream);
        // Note: Do NOT connect source to ctx.destination to prevent speaker acoustic feedback loop
        source.connect(analyser);

        audioContextRef.current = ctx;
        analyserRef.current = analyser;

        const timeDomainData = new Float32Array(analyser.fftSize);

        const monitorAudioAndSilence = async () => {
          if (!analyserRef.current || isStoppingRef.current) return;

          analyserRef.current.getFloatTimeDomainData(timeDomainData);
          const rms = calculateRMS(timeDomainData);
          const now = Date.now();
          const recordingElapsed = now - recordingStartTimeRef.current;

          // Ambient noise floor calibration during initial 600ms
          if (recordingElapsed < SILENCE_CONFIG.CALIBRATION_WINDOW_MS) {
            baselineNoiseRef.current = Math.min(baselineNoiseRef.current, Math.max(0.005, rms));
          }

          // Dynamic speech threshold adapted to ambient room noise
          const dynamicThreshold = Math.max(
            SILENCE_CONFIG.DEFAULT_SILENCE_THRESHOLD,
            baselineNoiseRef.current + 0.012
          );

          // Update UI visual waveform volume (0 - 100)
          const normalizedVol = Math.min(100, Math.round((rms / 0.15) * 100));
          setStatus((s) => (s.audioVolume === normalizedVol ? s : { ...s, audioVolume: normalizedVol }));

          // Speech Detection Logic
          if (rms >= dynamicThreshold) {
            hasSpokenRef.current = true;
            silenceStartTimeRef.current = null;
            setStatus((s) => (s.isSilenceFinishing ? { ...s, isSilenceFinishing: false } : s));
          } else {
            // Volume is below speech threshold (silence/pause)
            if (recordingElapsed >= SILENCE_CONFIG.INITIAL_GRACE_PERIOD_MS) {
              if (silenceStartTimeRef.current === null) {
                silenceStartTimeRef.current = now;
              } else {
                const silenceElapsed = now - silenceStartTimeRef.current;

                // Indicate finishing state in UI after 1.7s of silence
                if (silenceElapsed >= SILENCE_CONFIG.FINISHING_INDICATOR_MS) {
                  setStatus((s) => (s.isSilenceFinishing ? s : { ...s, isSilenceFinishing: true }));
                }

                // Auto-stop triggered when continuous silence exceeds 2.5 seconds
                if (silenceElapsed >= SILENCE_CONFIG.SILENCE_DURATION_MS) {
                  console.log(
                    `[useMediaDevices] Auto-stop triggered after ${silenceElapsed}ms silence | speechDetected=${hasSpokenRef.current}`
                  );
                  if (animFrameRef.current) {
                    cancelAnimationFrame(animFrameRef.current);
                    animFrameRef.current = null;
                  }

                  const result = await stopAudioRecording();
                  if (autoStopCallbackRef.current) {
                    autoStopCallbackRef.current(result);
                  }
                  return;
                }
              }
            }
          }

          animFrameRef.current = requestAnimationFrame(monitorAudioAndSilence);
        };

        animFrameRef.current = requestAnimationFrame(monitorAudioAndSilence);

        // Duration counter
        recordingTimerRef.current = setInterval(() => {
          setStatus((s) => ({ ...s, recordingDuration: s.recordingDuration + 1 }));
        }, 1000);

        setModality('audio', true);
        setStatus((s) => ({
          ...s,
          micActive: true,
          isAudioRecording: true,
          isSilenceFinishing: false,
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
          isSilenceFinishing: false,
          micError: errorMsg,
        }));
      }
    },
    [setModality, stopAudioStream, stopAudioRecording]
  );

  // Synchronize with store modality changes
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
