'use client';

import React, { useEffect, useState } from 'react';
import { History, MessageSquare, ChevronRight, PlusCircle, Sparkles, RefreshCw, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStressStore } from '@/store/useStressStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ApiService } from '@/services/api';
import { Session } from '@/types';

export interface SessionHistoryProps {
  onSelectSession?: (session: Session) => void;
}

/**
 * SessionHistory — Database-Backed Conversational History Panel.
 * Dynamically displays recorded therapy sessions, stress analytics, and emotion tags from SQLite.
 */
export function SessionHistory({ onSelectSession }: SessionHistoryProps) {
  const sessions = useStressStore((state) => state.sessions);
  const currentSessionId = useStressStore((state) => state.currentSessionId);
  const loadSession = useStressStore((state) => state.loadSession);
  const createNewSession = useStressStore((state) => state.createNewSession);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [isLoading, setIsLoading] = useState(false);

  const refreshHistory = async () => {
    setIsLoading(true);
    try {
      const logs = await ApiService.getChatHistory();
      if (logs && logs.length > 0) {
        useStressStore.getState().loadChatHistory(logs);
      }
    } catch (err) {
      console.warn('[SessionHistory] Failed to refresh sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshHistory();
  }, [isAuthenticated]);

  const handleSessionClick = (session: Session) => {
    loadSession(session);
    if (onSelectSession) {
      onSelectSession(session);
    }
  };

  const handleNewSession = () => {
    createNewSession();
    if (onSelectSession) {
      onSelectSession({
        id: 'new-session',
        title: 'New Therapy Conversation',
        date: 'Just now',
        durationMinutes: 1,
        summary: 'Fresh therapeutic check-in session.',
        avgStressLevel: 'low',
        avgStressScore: 25,
        dominantMood: 'Calm',
        messageCount: 1,
      });
    }
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <History className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-bold">Session History</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={refreshHistory}
              disabled={isLoading}
              title="Refresh session logs"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNewSession}
              className="h-7 text-xs px-2 gap-1 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 cursor-pointer font-bold"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              New
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5 pt-0">
        {sessions.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center space-y-1">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No previous sessions found</p>
            <p className="text-[11px] text-slate-400">Start communicating with MindCare to record your emotional wellbeing journey.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5 scrollbar-thin">
            {sessions.map((session) => {
              const isSelected = session.id === currentSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-500/50 shadow-xs ring-1 ring-teal-500/20'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {session.title}
                      </h4>
                      <Badge
                        variant={
                          session.avgStressLevel === 'low'
                            ? 'success'
                            : session.avgStressLevel === 'moderate'
                            ? 'warning'
                            : 'danger'
                        }
                        className="text-[9px] px-1.5 py-0"
                      >
                        {session.dominantMood || session.avgStressLevel}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {session.date}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {session.messageCount || 1} turns
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
