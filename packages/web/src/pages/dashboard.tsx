import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useEvents } from '../hooks/use-events';
import { AnimatedPage, LoadingSpinner } from '../components/animations';
import { Card } from '../components/card';
import { Button } from '../components/button';
import { Badge } from '../components/badge';
import { ProgressRing } from '../components/progress-ring';
import { BarChart } from '../components/bar-chart';
import { formatUptime, formatTimeAgo, formatFileSize, shortenPath } from '../utils/format';
import type { KlairEvent } from '../utils/mock-data';

export const Dashboard: React.FC = () => {
  const { events, session, loading } = useEvents(247);

  const chartData = useMemo(() => {
    const now = Date.now();
    const hours: { label: string; value: number; timestamp: number }[] = [];
    for (let i = 23; i >= 0; i--) {
      const ts = now - i * 3600000;
      hours.push({ label: new Date(ts).getHours() + ':00', value: 0, timestamp: ts });
    }
    for (const e of events) {
      const age = now - e.timestamp;
      const idx = 23 - Math.floor(age / 3600000);
      if (idx >= 0 && idx < 24) hours[idx].value++;
    }
    return hours;
  }, [events]);

  const recent = events.slice(0, 10);

  if (loading) {
    return (
      <AnimatedPage>
        <div className="flex justify-center h-64 items-center">
          <LoadingSpinner size={32} />
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="space-y-8">
        {/* Hero: 3-column grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Session Status */}
          <Card variant="data">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-noir-50 mb-5">
              session
            </h2>
            <div className="space-y-5">
              <div>
                <div className="text-xs text-noir-50 lowercase mb-0.5">uptime</div>
                <div className="text-2xl font-bold text-signal lowercase tracking-[-0.02em]">
                  {formatUptime(Date.now() - session.startTime)}
                </div>
              </div>
              <div>
                <div className="text-xs text-noir-50 lowercase mb-0.5">target</div>
                <div className="text-sm font-mono text-noir-70 truncate lowercase">
                  {session.targetDir}
                </div>
              </div>
              <div>
                <div className="text-xs text-noir-50 lowercase mb-0.5">events captured</div>
                <div className="text-lg font-semibold text-structure lowercase">
                  {session.eventCount}
                </div>
              </div>
            </div>
          </Card>

          {/* System Health */}
          <Card>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-noir-50 mb-5">
              health
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <ProgressRing
                value={Math.min(100, session.cpu * 100)}
                size={64}
                strokeWidth={5}
                color="#A91B18"
                label="cpu"
              />
              <ProgressRing
                value={Math.min(100, (session.memory / 1024) * 100)}
                size={64}
                strokeWidth={5}
                color="#CEE7F3"
                label="memory"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-[10px] text-noir-50 uppercase tracking-[0.1em] mb-0.5">latency</div>
                <div className="text-sm font-mono text-structure">{session.latency}ms</div>
              </div>
              <div>
                <div className="text-[10px] text-noir-50 uppercase tracking-[0.1em] mb-0.5">status</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-deep animate-pulse" />
                  <span className="text-sm text-structure lowercase">active</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-noir-50 mb-5">
              actions
            </h2>
            <div className="flex flex-col gap-3">
              <Button variant="primary" fullWidth icon={'\u25CB'}>
                start capture
              </Button>
              <Button variant="secondary" fullWidth>
                reset session
              </Button>
              <Button variant="ghost" fullWidth>
                view settings
              </Button>
            </div>
          </Card>
        </div>

        {/* Activity Chart */}
        <Card>
          <h2 className="text-[18px] font-semibold text-structure lowercase tracking-[-0.02em] mb-6">
            24-hour activity
          </h2>
          {events.length > 0 ? (
            <BarChart data={chartData} height={140} />
          ) : (
            <p className="text-sm text-noir-50 lowercase py-8 text-center">no activity yet</p>
          )}
        </Card>

        {/* Recent Events */}
        <Card>
          <h2 className="text-[18px] font-semibold text-structure lowercase tracking-[-0.02em] mb-5">
            recent events
          </h2>
          {recent.length === 0 ? (
            <p className="text-sm text-noir-50 lowercase py-8 text-center">no events captured yet</p>
          ) : (
            <div>
              {recent.map((e: KlairEvent, i: number) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 py-3 border-b border-noir-05 last:border-0 hover:bg-linen transition-colors cursor-pointer -mx-2 px-2 rounded-lg"
                >
                  <span className="text-[11px] font-mono text-noir-50 w-8 shrink-0">#{e.id}</span>
                  <Badge type={e.eventType as any} />
                  <span className="text-sm font-mono text-structure lowercase truncate flex-1 min-w-0">
                    {shortenPath(e.file)}
                  </span>
                  <span className="text-xs text-noir-50 font-mono lowercase shrink-0">
                    {formatFileSize(e.fileSize)}
                  </span>
                  <span className="text-[11px] text-noir-50 lowercase shrink-0">
                    {formatTimeAgo(e.timestamp)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AnimatedPage>
  );
};
