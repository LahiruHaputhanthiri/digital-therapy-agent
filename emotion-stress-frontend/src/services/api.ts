import { Message, MultimodalPayload, Session, StressEstimate, UserProfile } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Clean HTTP Service Abstraction for FastAPI Backend.
 * All functions include robust fallback to demo mode for testing and academic evaluation.
 */
export const ApiService = {
  /**
   * Health check endpoint
   */
  async checkHealth(): Promise<{ status: string; version: string; multimodalSupported: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
      if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
      return await res.json();
    } catch {
      return { status: 'demo_mode', version: '1.0.0-mock', multimodalSupported: true };
    }
  },

  /**
   * Send multimodal interaction frame to FastAPI
   */
  async processMultimodalTurn(payload: MultimodalPayload): Promise<{
    reply: string;
    stress: StressEstimate;
    emotions: Record<string, number>;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/therapy/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Backend processing error: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.warn('[ApiService] Backend unavailable, operating in local mock mode:', err);
      // Fallback simulated response
      return {
        reply: getMockResponse(payload.text || ''),
        stress: {
          level: 'moderate',
          score: 42,
          confidence: 0.85,
          trend: 'stable',
          lastUpdated: new Date().toISOString(),
          disclaimer: 'Simulated evaluation mode. Backend disconnected.',
        },
        emotions: { neutral: 52, joy: 20, sadness: 14, fear_anxiety: 10, anger: 4 },
      };
    }
  },

  /**
   * Fetch past therapy sessions
   */
  async getSessions(): Promise<Session[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/therapy/sessions`);
      if (!res.ok) throw new Error('Failed to fetch sessions');
      return await res.json();
    } catch {
      return [];
    }
  },

  /**
   * Update user profile settings
   */
  async updateUserProfile(profile: Partial<UserProfile>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};

function getMockResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('breath') || lower.includes('relax') || lower.includes('overwhelm')) {
    return "I hear the weight you're carrying. Let's slow down for just a few moments. Would you like to try a gentle 4-second box breathing exercise together?";
  }
  if (lower.includes('anxious') || lower.includes('stress') || lower.includes('panic') || lower.includes('grounding')) {
    return "Thank you for sharing that with me. It is completely okay to pause right now. Let's try the 5-4-3-2-1 grounding exercise: notice five things you can see around you.";
  }
  if (lower.includes('thank') || lower.includes('better')) {
    return "I'm glad to hear that. Acknowledging your own calm moments is a powerful step. How is your body feeling right now?";
  }
  return "Thank you for sharing. I'm listening. How has this been affecting your energy and thoughts throughout the day?";
}
