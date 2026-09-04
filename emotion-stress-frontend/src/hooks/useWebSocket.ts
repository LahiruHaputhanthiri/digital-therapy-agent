'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ConnectionStatus, MultimodalWebSocketClient, WebSocketCallbacks } from '@/services/websocket';
import { useStressStore } from '@/store/useStressStore';
import { buildMultimodalPayload } from '@/services/multimodal';
import { MockMultimodalService } from '@/services/mockMultimodalService';
import { ApiService } from '@/services/api';

/**
 * Strict-Mode-Safe WebSocket Hook for Multimodal Therapy Stream.
 *
 * Guarantees:
 * 1. Single stable lifecycle tied exclusively to Mount/Unmount.
 * 2. Mutable callbacksRef prevents stale closures without re-triggering connect().
 * 3. Tolerates React Strict Mode mount -> cleanup -> remount with generation ID safety.
 * 4. Automatic recovery to 'connected' on backend restart.
 */
export function useWebSocket() {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const clientRef = useRef<MultimodalWebSocketClient | null>(null);
  const callbacksRef = useRef<WebSocketCallbacks>({});
  const lastPromptRef = useRef<string>('');
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updateStreamingMessage = useStressStore((state) => state.updateStreamingMessage);
  const addMessage = useStressStore((state) => state.addMessage);
  const updateMessageContent = useStressStore((state) => state.updateMessageContent);
  const updateLastUserMessageContent = useStressStore((state) => state.updateLastUserMessageContent);
  const setAiTyping = useStressStore((state) => state.setAiTyping);
  const updateStressEstimate = useStressStore((state) => state.updateStressEstimate);
  const updateEmotionProbabilities = useStressStore((state) => state.updateEmotionProbabilities);
  const triggerSafetyProtocol = useStressStore((state) => state.triggerSafetyProtocol);

  // Keep live callbacks synchronized without re-triggering connection lifecycle
  callbacksRef.current = {
    onStatusChange: (newStatus) => {
      setStatus(newStatus);
      if (newStatus === 'disconnected' || newStatus === 'reconnecting') {
        if (watchdogTimerRef.current) {
          clearTimeout(watchdogTimerRef.current);
          watchdogTimerRef.current = null;
        }
        if (useStressStore.getState().isAiTyping) {
          setAiTyping(false);
        }
      }
    },
    onToken: (token, messageId) => {
      updateStreamingMessage(messageId, token);
    },
    onAiReply: (data) => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
      setAiTyping(false);
      const userText = data.transcription && data.transcription.trim()
        ? `🎤 "${data.transcription.trim()}"`
        : lastPromptRef.current || '🎤 [Voice message]';

      if (data.transcription && data.transcription.trim()) {
        updateLastUserMessageContent(`🎤 "${data.transcription.trim()}"`);
      } else if (!lastPromptRef.current) {
        updateLastUserMessageContent(`🎤 [Voice message]`);
      }

      addMessage({
        sender: 'assistant',
        content: data.replyText,
        stressSnapshot: data.stressSnapshot,
        detectedEmotions: data.detectedEmotions,
        activeModalities: data.activeModalities,
      });

      // Automatically persist completed turn to SQLite database
      const topEmotion = data.detectedEmotions ? Object.keys(data.detectedEmotions)[0] : 'neutral';
      const stressVal = data.stressSnapshot?.score !== undefined ? data.stressSnapshot.score / 100 : 0.35;
      ApiService.saveChatTurn({
        user_message: userText,
        ai_response: data.replyText,
        detected_emotion: topEmotion,
        stress_score: stressVal,
      }).catch((err) => console.warn('[useWebSocket] Failed to auto-persist turn:', err));
    },
    onMetricsUpdate: (data) => {
      updateStressEstimate(data.stress);
      updateEmotionProbabilities(data.emotions);
      if (data.safety && data.safety.isTriggered) {
        triggerSafetyProtocol(data.safety);
      }
    },
    onSafetyAlert: (safety) => {
      triggerSafetyProtocol(safety);
    },
    onError: (error) => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
      if (useStressStore.getState().isAiTyping) {
        setAiTyping(false);
      }
      console.warn('[useWebSocket Callback Error]:', error);
    },
  };

  useEffect(() => {
    const client = new MultimodalWebSocketClient();
    clientRef.current = client;

    client.setCallbacks({
      onStatusChange: (s) => callbacksRef.current.onStatusChange?.(s),
      onToken: (tok, id) => callbacksRef.current.onToken?.(tok, id),
      onAiReply: (d) => callbacksRef.current.onAiReply?.(d),
      onMetricsUpdate: (m) => callbacksRef.current.onMetricsUpdate?.(m),
      onSafetyAlert: (s) => callbacksRef.current.onSafetyAlert?.(s),
      onError: (e) => callbacksRef.current.onError?.(e),
    });

    client.connect();

    return () => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
      client.disconnect();
      clientRef.current = null;
    };
  }, []);

  /**
   * Sends multimodal turn to WebSocket or falls back gracefully to REST / Mock simulation.
   */
  const sendMultimodalTurn = useCallback(
    async (
      text: string,
      audioMetrics?: { audio?: string; volumeDb: number; recordingDurationSeconds: number }
    ) => {
      const state = useStressStore.getState();
      const isVoiceRecording = Boolean(audioMetrics?.audio);
      const userDisplayContent =
        text || (isVoiceRecording ? '🎤 [Voice message processing...]' : '');

      const recentHistory = state.messages
        .filter(
          (m) =>
            (m.sender === 'user' || m.sender === 'assistant') &&
            !m.id.startsWith('msg-new-') &&
            !m.id.startsWith('msg-welcome-')
        )
        .slice(-6)
        .map((m) => ({ sender: m.sender, content: m.content }));

      const payload = buildMultimodalPayload({
        sessionId: state.currentSessionId,
        language: state.language,
        text,
        modalities: state.activeModalities,
        keystrokeMetrics: state.keystrokeMetrics,
        audioMetrics,
        history: recentHistory,
      });

      lastPromptRef.current = text || (isVoiceRecording ? '🎤 [Voice message]' : '');

      console.log(`[useWebSocket] sendMultimodalTurn | text: "${text}" | isVoice: ${isVoiceRecording} | historyTurns: ${recentHistory.length} | audioDataLen: ${audioMetrics?.audio?.length || 0} | payload.audioAttached: ${Boolean(payload.audioFeatures?.audio)}`);

      // 1. Add User Message to local store
      const createdUserMsg = state.addMessage({
        sender: 'user',
        content: userDisplayContent,
        activeModalities: { ...state.activeModalities },
      });

      state.setAiTyping(true);

      // 2. If WS is connected or connecting, send payload to backend
      const sentViaWs = clientRef.current?.sendMessage(payload);

      if (sentViaWs) {
        // Start 12-second watchdog timer safety net: silently resets isAiTyping if backend stalls
        if (watchdogTimerRef.current) {
          clearTimeout(watchdogTimerRef.current);
        }
        watchdogTimerRef.current = setTimeout(() => {
          const currentState = useStressStore.getState();
          if (currentState.isAiTyping) {
            console.warn('[useWebSocket] Watchdog safety net triggered (12s limit). Unlocking input bar.');
            currentState.setAiTyping(false);
          }
        }, 12000);
      } else {
        // Attempt REST API first, then fallback to MockMultimodalService
        try {
          const result = await ApiService.processMultimodalTurn(payload);

          state.setAiTyping(false);
          const finalUserPrompt = result.transcription && result.transcription.trim()
            ? `🎤 "${result.transcription.trim()}"`
            : userDisplayContent;

          if (result.transcription && result.transcription.trim()) {
            state.updateMessageContent(createdUserMsg.id, `🎤 "${result.transcription.trim()}"`);
          } else if (isVoiceRecording) {
            state.updateMessageContent(createdUserMsg.id, `🎤 [Voice message]`);
          }

          state.addMessage({
            sender: 'assistant',
            content: result.reply,
            stressSnapshot: {
              score: result.stress.score,
              level: result.stress.level,
            },
            detectedEmotions: result.emotions,
            activeModalities: { ...state.activeModalities },
          });

          state.updateStressEstimate(result.stress);
          state.updateEmotionProbabilities(result.emotions);

          // Auto-persist turn
          const topEmotion = Object.keys(result.emotions || {})[0] || 'neutral';
          ApiService.saveChatTurn({
            user_message: finalUserPrompt,
            ai_response: result.reply,
            detected_emotion: topEmotion,
            stress_score: (result.stress?.score ?? 35) / 100,
          }).catch((e) => console.warn('[useWebSocket] REST turn persistence failed:', e));
        } catch (restErr) {
          console.warn('[useWebSocket] REST endpoint failed, falling back to local simulation:', restErr);
          try {
            const result = await MockMultimodalService.processTurn(payload);

            state.setAiTyping(false);
            if ('transcription' in result && typeof (result as { transcription?: string }).transcription === 'string' && (result as { transcription: string }).transcription.trim()) {
              state.updateMessageContent(createdUserMsg.id, `🎤 "${(result as { transcription: string }).transcription.trim()}"`);
            } else if (isVoiceRecording) {
              state.updateMessageContent(createdUserMsg.id, `🎤 [Voice message]`);
            }
            state.addMessage({
              sender: 'assistant',
              content: result.reply,
              stressSnapshot: {
                score: result.stress.score,
                level: result.stress.level,
              },
              detectedEmotions: result.emotions,
              activeModalities: { ...state.activeModalities },
            });

            state.updateStressEstimate(result.stress);
            state.updateEmotionProbabilities(result.emotions);

            if (result.safety.isTriggered) {
              state.triggerSafetyProtocol(result.safety);
            }

            // Auto-persist simulated turn
            const topEmotion = Object.keys(result.emotions || {})[0] || 'neutral';
            ApiService.saveChatTurn({
              user_message: userDisplayContent,
              ai_response: result.reply,
              detected_emotion: topEmotion,
              stress_score: (result.stress?.score ?? 35) / 100,
            }).catch((e) => console.warn('[useWebSocket] Mock turn persistence failed:', e));
          } catch (err) {
            state.setAiTyping(false);
            console.error('[useWebSocket] Fallback pipeline failed:', err);
          }
        }
      }
    },
    []
  );

  return {
    status,
    isConnected: status === 'connected',
    sendMultimodalTurn,
  };
}
