import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useEvents } from '../hooks/use-api';
import { AnimatedPage, LoadingSpinner } from '../components/animations';
import { Card } from '../components/card';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import type { KlairEvent } from '../utils/api';

interface Props {
  onSelectEvent: (id: number) => void;
}

function ago(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  return Math.floor(m / 60) + 'h ' + (m % 60) + 'm ago';
}

function short(p: string, max = 42): string {
  if (!p) return '';
  const h = (typeof process !== 'undefined' && (process as any).env?.HOME) || '';
  let x = h && p.startsWith(h) ? '~' + p.slice(h.length) : p;
  return x.length > max ? '\u2026' + x.slice(-(max - 1)) : x;
}

const PAGE_SIZE = 15;

export const Events: React.FC<Props> = ({ onSelectEvent }) => {
  const { events, loading } = useEvents(200);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sel, setSel] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [jump, setJump] = useState('');

  const filtered = useMemo(() => {
    let list = events;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) => e.file.toLowerCase().includes(q));
    }
    if (typeFilter !== 'all') {
      list = list.filter((e) => e.eventType === typeFilter);
    }
    return list;
  }, [events, query, typeFilter]);

  const total = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleJump = () => {
    const n = parseInt(jump, 10);
    if (n >= 1 && n <= total) {
      setPage(n - 1);
      setJump('');
    }
  };

  if (loading) {
    return (
      <AnimatedPage>
        <div className="flex justify-center h-64 items-center">
          <LoadingSpinner />
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="space-y-6">
        {/* Search + Filter Bar */}
        <Card padding="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-30 text-sm">/</span>
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                placeholder="search by filename"
                className="w-full pl-8 pr-4 py-2 rounded-lg border border-noir-10 text-sm text-structure placeholder:text-noir-20 bg-noir-05 focus:outline-none focus:border-noir-20 focus:bg-white transition-colors lowercase"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
              className="px-3 py-2 rounded-lg border border-noir-10 text-sm text-noir-70 bg-noir-05 focus:outline-none focus:border-noir-20 lowercase appearance-none cursor-pointer"
            >
              <option value="all">all types</option>
              <option value="add">create</option>
              <option value="change">modify</option>
              <option value="unlink">delete</option>
            </select>
            <span className="text-xs text-noir-50 lowercase shrink-0">
              {filtered.length} events
            </span>
          </div>
        </Card>

        {/* Timeline */}
        <Card padding="p-6">
          {paged.length === 0 ? (
            <p className="text-sm text-noir-50 lowercase py-12 text-center">
              {query || typeFilter !== 'all' ? 'no matching events' : 'no events captured yet'}
            </p>
          ) : (
            <div className="relative">
              {/* Spine */}
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-cerulean" />

              {paged.map((e: KlairEvent) => {
                const active = sel === e.id;
                const dotColor = e.eventType === 'unlink'
                  ? 'bg-signal'
                  : e.eventType === 'add'
                    ? 'bg-green-500'
                    : e.eventType === 'change'
                      ? 'bg-cerulean'
                      : 'bg-noir-20';

                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => { setSel(e.id); onSelectEvent(e.id); }}
                    className={`relative flex items-start gap-4 py-4 pl-8 pr-4 rounded-xl cursor-pointer transition-colors ${
                      active ? 'bg-noir-05 ring-1 ring-noir-10' : 'hover:bg-noir-05'
                    }`}
                  >
                    {/* Dot on spine */}
                    <div className={`absolute left-[11px] top-5 w-2.5 h-2.5 rounded-full border-2 border-white ${dotColor} ${
                      active ? 'ring-2 ring-noir-20' : ''
                    }`} />

                    {/* Timestamp column */}
                    <div className="w-20 shrink-0 text-right">
                      <div className="text-[11px] font-mono text-noir-50">{ago(e.timestamp)}</div>
                      <div className="text-[10px] text-noir-20 lowercase mt-0.5">#{e.id}</div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono text-structure truncate lowercase">
                          {short(e.file)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge type={e.eventType as any} />
                        {active && (
                          <span className="text-[10px] text-signal lowercase font-medium ml-1">
                            selected \u2192
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Pagination */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(Math.max(0, page - 1))}
            >
              prev
            </Button>

            <div className="flex items-center gap-1.5 text-xs text-noir-50 lowercase">
              <span>{page + 1}</span>
              <span className="text-noir-20">/</span>
              <span>{total}</span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              disabled={page >= total - 1}
              onClick={() => setPage(Math.min(total - 1, page + 1))}
            >
              next
            </Button>

            {/* Jump to page */}
            <div className="flex items-center gap-1.5 ml-3">
              <input
                type="text"
                value={jump}
                onChange={(e) => setJump(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleJump()}
                placeholder="go"
                className="w-10 px-2 py-1 rounded-lg border border-noir-10 text-xs text-structure text-center bg-noir-05 focus:outline-none focus:border-noir-20 lowercase"
              />
              <Button variant="ghost" size="sm" onClick={handleJump}>
                go
              </Button>
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};
