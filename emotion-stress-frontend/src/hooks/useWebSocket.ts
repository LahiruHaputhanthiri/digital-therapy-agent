'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ConnectionStatus, MultimodalWebSocketClient } from '@/services/websocket';
import { useStressStore } from '@/store/useStressStore';
import { buildMultimodalPayload } from '@/services/multimodal';
import { MockMultimodalService } from '@/services/mockMultimodalService';

export function useWebSocket() {
  const [status, setStatus] = useState<ConnectionStatus>('demo');
  const clientRef = useRef<MultimodalWebSocketClient | null>(null);

  const currentSessionId = useStressStore((state) => state.currentSessionId);
  const activeModalities = useStressStore((state) => state.activeModalities);
  const keystrokeMetrics = useStressStore((state) => state.keystrokeMetrics);
  const addMessage = useStressStore((state) => state.addMessage);
  const updateStreamingMessage = useStressStore((state) => state.updateStreamingMessage);
  const setAiTyping = useStressStore((state) => state.setAiTyping);
  const updateStressEstimate = useStressStore((state) => state.updateStressEstimate);
  const updateEmotionProbabilities = useStressStore((state) => state.updateEmotionProbabilities);
  const triggerSafetyProtocol = useStressStore((state) => state.triggerSafetyProtocol);

  useEffect(() => {
    const client = new MultimodalWebSocketClient();
    clientRef.current = client;

    client.setCallbacks({
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
      },
      onToken: (token, messageId) => {
        updateStreamingMessage(messageId, token);
      },
      onAiReply: (data) => {
        setAiTyping(false);
        addMessage({
          sender: 'assistant',
          content: data.replyText,
          stressSnapshot: data.stressSnapshot,
          detectedEmotions: data.detectedEmotions,
          activeModalities: data.activeModalities,
        });
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
    });

    client.connect();

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [
    updateStreamingMessage,
    addMessage,
    setAiTyping,
    updateStressEstimate,
    updateEmotionProbabilities,
    triggerSafetyProtocol,
  ]);

  /**
   * Sends multimodal turn to WebSocket or falls back gracefully to local mock service
   */
  const sendMultimodalTurn = useCallback(
    async (text: string, audioMetrics?: { volumeDb: number; recordingDurationSeconds: number }) => {
      const payload = buildMultimodalPayload({
        sessionId: currentSessionId,
        text,
        modalities: activeModalities,
        keystrokeMetrics,
        audioMetrics,
      });

      // 1. Add User Message to local store
      addMessage({
        sender: 'user',
        content: text,
        activeModalities: { ...activeModalities },
      });

      setAiTyping(true);

      // 2. If WS is connected, send payload to backend
      const sentViaWs = clientRef.current?.sendMessage(payload);

      if (!sentViaWs) {
        // Fallback to MockMultimodalService with realistic processing latency
        try {
          const result = await MockMultimodalService.processTurn(payload);

          setAiTyping(false);
          addMessage({
            sender: 'assistant',
            content: result.reply,
            stressSnapshot: {
              score: result.stress.score,
              level: result.stress.level,
            },
            detectedEmotions: result.emotions,
            activeModalities: { ...activeModalities },
          });

          updateStressEstimate(result.stress);
          updateEmotionProbabilities(result.emotions);

          if (result.safety.isTriggered) {
            triggerSafetyProtocol(result.safety);
          }
        } catch (err) {
          setAiTyping(false);
          console.error('[MockService Error]:', err);
        }
      }
    },
    [
      currentSessionId,
      activeModalities,
      keystrokeMetrics,
      addMessage,
      setAiTyping,
      updateStressEstimate,
      updateEmotionProbabilities,
      triggerSafetyProtocol,
    ]
  );

  return {
    status,
    sendMultimodalTurn,
  };
}
