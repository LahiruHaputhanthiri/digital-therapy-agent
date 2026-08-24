import {
  ClientMessage,
  EmotionProbability,
  InterventionType,
  ModalityAvailability,
  MultimodalPayload,
  SafetyRiskAssessment,
  ServerMessage,
  StressEstimate,
  StressLevel,
} from '@/types';

export type ConnectionStatus = 'connected' | 'connecting' | 'offline' | 'demo';

export interface WebSocketCallbacks {
  onStatusChange?: (status: ConnectionStatus) => void;
  onToken?: (token: string, messageId: string) => void;
  onAiReply?: (data: {
    messageId: string;
    replyText: string;
    suggestedAction?: InterventionType;
    activeModalities?: ModalityAvailability;
    stressSnapshot?: { score: number; level: StressLevel };
    detectedEmotions?: Partial<EmotionProbability>;
  }) => void;
  onMetricsUpdate?: (data: {
    stress: StressEstimate;
    emotions: EmotionProbability;
    safety?: SafetyRiskAssessment;
  }) => void;
  onSafetyAlert?: (safety: SafetyRiskAssessment) => void;
  onError?: (error: Error) => void;
}

export class MultimodalWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private callbacks: WebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;

  constructor(url?: string) {
    this.url = url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/therapy';
  }

  public setCallbacks(callbacks: WebSocketCallbacks) {
    this.callbacks = callbacks;
  }

  public connect() {
    this.isIntentionallyClosed = false;
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.callbacks.onStatusChange?.('connecting');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.callbacks.onStatusChange?.('connected');
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: ServerMessage = JSON.parse(event.data);
          this.handleServerMessage(message);
        } catch (err) {
          console.warn('[WebSocket] Unrecognized message payload:', err);
        }
      };

      this.ws.onerror = (_event) => {
        this.callbacks.onStatusChange?.('offline');
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        if (!this.isIntentionallyClosed) {
          this.callbacks.onStatusChange?.('offline');
          this.attemptReconnect();
        }
      };
    } catch {
      this.callbacks.onStatusChange?.('offline');
      this.attemptReconnect();
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const ping: ClientMessage = { type: 'PING' };
        this.ws.send(JSON.stringify(ping));
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts += 1;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 5000);
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      this.callbacks.onStatusChange?.('demo');
    }
  }

  private handleServerMessage(msg: ServerMessage) {
    switch (msg.type) {
      case 'STREAM_TOKEN':
        this.callbacks.onToken?.(msg.token, msg.messageId);
        break;
      case 'AI_REPLY':
        this.callbacks.onAiReply?.(msg);
        break;
      case 'METRICS_UPDATE':
        this.callbacks.onMetricsUpdate?.(msg);
        break;
      case 'SAFETY_ALERT':
        this.callbacks.onSafetyAlert?.(msg.safety);
        break;
      case 'PONG':
        // Heartbeat response acknowledged
        break;
      case 'ERROR':
        console.warn('[WebSocket Server Error]:', msg.message);
        break;
    }
  }

  public sendMessage(payload: MultimodalPayload): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const envelope: ClientMessage = {
        type: 'CLIENT_MESSAGE',
        payload,
      };
      this.ws.send(JSON.stringify(envelope));
      return true;
    }
    return false;
  }

  public disconnect() {
    this.isIntentionallyClosed = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.callbacks.onStatusChange?.('offline');
  }
}
