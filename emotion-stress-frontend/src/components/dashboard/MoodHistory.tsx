'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Heart, TrendingDown, Calendar, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStressStore } from '@/store/useStressStore';
import { useTheme } from '@/hooks/useTheme';

/**
 * MoodHistory Component - Phase 3 Visualizer
 * Renders weekly longitudinal mood and stress trend progression with Recharts,
 * dynamic theme-aware styling, custom glassmorphism tooltips, and day annotations.
 */
export function MoodHistory() {
  const moodHistory = useStressStore((state) => state.moodHistory);
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const latestRecord = moodHistory[moodHistory.length - 1];
  const isDark = resolvedTheme === 'dark';

  // Dynamic Theme-Aware Recharts Colors
  const chartStrokeColor = isDark ? '#60a5fa' : '#3b82f6';
  const axisColor = isDark ? '#64748b' : '#94a3b8';
  const axisLineColor = isDark ? '#334155' : '#e2e8f0';
  const referenceLineColor = isDark ? '#1e293b' : '#cbd5e1';

  return (
    <Card className="border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500 dark:text-rose-400" />
            <CardTitle className="text-sm font-semibold">Weekly Longitudinal Mood Trend</CardTitle>
          </div>
          {latestRecord && (
            <Badge variant="accent" className="text-[10px] py-0 px-2">
              Today: {latestRecord.label} ({latestRecord.estimatedStress}%)
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Recharts Area Visualization Container */}
        <div className="h-40 w-full pt-1 min-w-0">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={150}>
              <AreaChart
                data={moodHistory}
                margin={{ top: 8, right: 12, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="stressAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartStrokeColor} stopOpacity={isDark ? 0.45 : 0.35} />
                    <stop offset="95%" stopColor={chartStrokeColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  stroke={axisColor}
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: axisLineColor, strokeWidth: 1 }}
                />
                <YAxis
                  stroke={axisColor}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  ticks={[25, 50, 75]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 shadow-xl text-[11px] border border-slate-200 dark:border-slate-700">
                          <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-blue-500" />
                            {data.day} ({data.date})
                          </p>
                          <div className="mt-1 space-y-0.5">
                            <p className="text-teal-600 dark:text-teal-400 font-semibold">
                              Dominant Mood: {data.label}
                            </p>
                            <p className="text-blue-600 dark:text-blue-400 font-semibold">
                              Est. Stress Level: {data.estimatedStress}%
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={50}
                  stroke={referenceLineColor}
                  strokeDasharray="3 3"
                  label={{ value: 'Midline (50%)', fill: axisColor, fontSize: 9, position: 'insideTopRight' }}
                />
                <Area
                  type="monotone"
                  dataKey="estimatedStress"
                  stroke={chartStrokeColor}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#stressAreaGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
              Loading longitudinal trends...
            </div>
          )}
        </div>

        {/* Legend and Analysis Summary */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
          <div className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full shadow-xs"
              style={{ backgroundColor: chartStrokeColor }}
            />
            <span>Calculated Stress Signal</span>
          </div>
          <span className="text-[10px] text-slate-400">7-Day Rolling Summary</span>
        </div>
      </CardContent>
    </Card>
  );
}
