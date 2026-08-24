'use client';

import React from 'react';
import { History, MessageSquare, ChevronRight, PlusCircle, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStressStore } from '@/store/useStressStore';
import { Session } from '@/types';

export function SessionHistory() {
  const sessions = useStressStore((state) => state.sessions);
  const currentSessionId = useStressStore((state) => state.currentSessionId);
  const loadSession = useStressStore((state) => state.loadSession);
  const createNewSession = useStressStore((state) => state.createNewSession);

  return (
    <Card className="border-slate-200/80 dark:border-slate-800/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <CardTitle className="text-sm font-semibold">Session History</CardTitle>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={createNewSession}
            className="h-7 text-xs px-2 gap-1 text-blue-600 dark:text-blue-400"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {sessions.length === 0 ? (
          <div className="py-6 px-3 text-center space-y-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
            <div className="mx-auto h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-500">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                No previous sessions
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[200px] mx-auto">
                Your conversations and reflections will appear here.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={createNewSession}
              className="text-xs rounded-xl h-8"
            >
              Start a conversation
            </Button>
          </div>
        ) : (
          sessions.map((session: Session) => {
            const isCurrent = session.id === currentSessionId;
            return (
              <button
                key={session.id}
                onClick={() => loadSession(session)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all duration-200 flex flex-col gap-1 cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-50/70 border-blue-200 dark:bg-blue-950/60 dark:border-blue-800/80 shadow-xs'
                    : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/80 dark:bg-slate-800/60 dark:border-slate-750 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                    {session.title}
                  </span>
                  <Badge
                    variant={
                      session.avgStressLevel === 'low'
                        ? 'success'
                        : session.avgStressLevel === 'moderate'
                        ? 'warning'
                        : 'danger'
                    }
                    className="text-[10px] px-1.5 py-0"
                  >
                    {session.dominantMood}
                  </Badge>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 leading-snug">
                  {session.summary}
                </p>

                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 dark:text-slate-400">
                  <span>{session.date}</span>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{session.messageCount} turns</span>
                    <ChevronRight className="h-3 w-3 ml-0.5 opacity-50" />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
