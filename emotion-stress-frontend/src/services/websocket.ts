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

export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'offline'
  | 'demo';

export interface WebSocketCallbacks {
  onStatusChange?: (status: ConnectionStatus) => void;
  onToken?: (token: string, messageId: string) => void;
  onAiReply?: (data: {
    messageId: string;
    replyText: string;
    transcription?: string;
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

/**
 * Derives the canonical WebSocket endpoint URL from environment or current window host.
 */
export function getCanonicalWebSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || 'localhost';
    return `ws://${host}:8000/ws/therapy`;
  }
  return 'ws://localhost:8000/ws/therapy';
}

/**
 * Strict-Mode-Safe WebSocket Client for Multimodal Therapy Streams.
 *
 * Key Architectural Guarantees:
 * 1. Generation/Connection-ID Tracking to protect against React Strict Mode mount-cleanup races.
 * 2. Controlled Bounded Exponential Backoff (1s, 2s, 4s, 8s, max 10s).
 * 3. Instance-Aware Teardown: Old cleanup never closes or invalidates a newer active connection.
 * 4. Intentional Disconnect Flag: Prevents reconnect loops when unmounting.
 * 5. Message Queuing during CONNECTING state.
 */
export class MultimodalWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private callbacks: WebSocketCallbacks = {};
  private currentConnectionId = 0;
  private isManuallyDisconnected = false;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private currentStatus: ConnectionStatus = 'disconnected';
  private messageQueue: ClientMessage[] = [];

  constructor(url?: string) {
    this.url = url || getCanonicalWebSocketUrl();
  }

  public setCallbacks(callbacks: WebSocketCallbacks) {
    this.callbacks = callbacks;
  }

  public getStatus(): ConnectionStatus {
    return this.currentStatus;
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  private setStatus(newStatus: ConnectionStatus) {
    if (this.currentStatus !== newStatus) {
      this.currentStatus = newStatus;
      this.callbacks.onStatusChange?.(newStatus);
    }
  }

  /**
   * Initiates a connection attempt with generation ID protection.
   */
  public connect() {
    this.isManuallyDisconnected = false;

    // Prevent duplicate connections if already open or connecting
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    // Increment generation ID
    this.currentConnectionId += 1;
    const connectionId = this.currentConnectionId;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.setStatus('connecting');
    console.log(`[WS] Connecting to ${this.url} (gen #${connectionId})...`);

    try {
      const socket = new WebSocket(this.url);
      this.ws = socket;

      socket.onopen = () => {
        // Guard: Check if this callback belongs to the currently active generation
        if (connectionId !== this.currentConnectionId || this.ws !== socket) {
          return;
        }

        this.reconnectAttempts = 0;
        this.setStatus('connected');
        console.log('[WS] Connected successfully');
        this.startHeartbeat(connectionId);
        this.flushMessageQueue();
      };

      socket.onmessage = (event: MessageEvent) => {
        if (connectionId !== this.currentConnectionId || this.ws !== socket) {
          return;
        }

        try {
          const message: ServerMessage = JSON.parse(event.data);
          this.handleServerMessage(message);
        } catch (err) {
          console.warn('[WS] Failed to parse incoming server message:', err);
        }
      };

      socket.onerror = (_event: Event) => {
        if (connectionId !== this.currentConnectionId || this.ws !== socket) {
          return;
        }
        console.warn('[WS] Connection error encountered');
      };

      socket.onclose = () => {
        if (connectionId !== this.currentConnectionId || this.ws !== socket) {
          return;
        }

        this.stopHeartbeat();
        this.ws = null;

        if (!this.isManuallyDisconnected) {
          this.setStatus('reconnecting');
          this.scheduleReconnect();
        } else {
          this.setStatus('disconnected');
          console.log('[WS] Disconnected cleanly');
        }
      };
    } catch (err) {
      console.warn('[WS] Socket initialization error:', err);
      if (connectionId === this.currentConnectionId) {
        this.ws = null;
        if (!this.isManuallyDisconnected) {
          this.setStatus('reconnecting');
          this.scheduleReconnect();
        } else {
          this.setStatus('disconnected');
        }
      }
    }
  }

  private startHeartbeat(connectionId: number) {
    this.stopHeartbeat();
    this.pingTimer = setInterval(() => {
      if (
        connectionId === this.currentConnectionId &&
        this.ws &&
        this.ws.readyState === WebSocket.OPEN
      ) {
        const ping: ClientMessage = { type: 'PING' };
        this.ws.send(JSON.stringify(ping));
      }
    }, 25000);
  }

  private stopHeartbeat() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  /**
   * Bounded exponential backoff reconnection.
   * Delays: 1s -> 2s -> 4s -> 8s -> capped at 10s.
   */
  private scheduleReconnect() {
    if (this.isManuallyDisconnected) return;

    this.reconnectAttempts += 1;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 10000);
    console.log(`[WS] Reconnecting in ${delay}ms (attempt #${this.reconnectAttempts})...`);

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isManuallyDisconnected) {
        this.connect();
      }
    }, delay);
  }

  private flushMessageQueue() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      if (msg) {
        try {
          this.ws.send(JSON.stringify(msg));
        } catch (err) {
          console.warn('[WS] Failed to flush queued message:', err);
        }
      }
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
        console.warn('[WS Server Error Notice]:', msg.message);
        break;
    }
  }

  /**
   * Sends multimodal interaction frame. Queues payload if currently connecting.
   */
  public sendMessage(payload: MultimodalPayload): boolean {
    const envelope: ClientMessage = {
      type: 'CLIENT_MESSAGE',
      payload,
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(envelope));
      return true;
    }

    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      console.log('[WS] Socket is connecting; message queued.');
      this.messageQueue.push(envelope);
      return true;
    }

    return false;
  }

  /**
   * Performs an intentional, instance-aware clean teardown.
   */
  public disconnect() {
    this.isManuallyDisconnected = true;
    this.currentConnectionId += 1; // Invalidate any callbacks from previous sockets

    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.reconnectAttempts = 0;
    this.messageQueue = [];

    if (this.ws) {
      const socketToClose = this.ws;
      this.ws = null;

      // Nullify handlers so closing events don't trigger state updates
      socketToClose.onopen = null;
      socketToClose.onmessage = null;
      socketToClose.onerror = null;
      socketToClose.onclose = null;

      if (
        socketToClose.readyState === WebSocket.OPEN ||
        socketToClose.readyState === WebSocket.CONNECTING
      ) {
        try {
          socketToClose.close();
        } catch {
          // Ignore close error on unmounted socket
        }
      }
    }

    this.setStatus('disconnected');
  }
}
