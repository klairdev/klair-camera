import React, { useState, useMemo } from 'react';
import { AnimatedPage, LoadingSpinner } from '../components/animations';
import { Card } from '../components/card';
import { Button } from '../components/button';
import { Timeline } from '../components/timeline';
import { useEvents } from '../hooks/use-events';

interface TimelinePageProps {
  onSelectEvent: (id: number) => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({ onSelectEvent }) => {
  const { events, loading, getPage } = useEvents(247);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [jumpInput, setJumpInput] = useState('');

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

  const paged = useMemo(() => {
    const start = page * 20;
    return filtered.slice(start, start + 20);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / 20));

  const handleSelect = (id: number) => {
    setSelectedId(id);
    onSelectEvent(id);
  };

  const handleJump = () => {
    const n = parseInt(jumpInput, 10);
    if (n >= 1 && n <= totalPages) {
      setPage(n - 1);
      setJumpInput('');
    }
  };

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
      <div className="space-y-6">
        {/* Search + Filter */}
        <Card padding="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-30 text-sm">/</span>
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                placeholder="search by filename"
                className="w-full pl-8 pr-4 py-2 rounded-lg border border-noir-10 text-sm text-structure placeholder:text-noir-30 bg-noir-05 focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal/20 transition-colors lowercase"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
              className="px-3 py-2 rounded-lg border border-noir-10 text-sm text-noir-70 bg-noir-05 focus:outline-none focus:border-signal lowercase appearance-none cursor-pointer"
            >
              <option value="all">all types</option>
              <option value="create">create</option>
              <option value="modify">modify</option>
              <option value="delete">delete</option>
            </select>
            <span className="text-xs text-noir-50 lowercase shrink-0">
              {filtered.length} events
            </span>
          </div>
        </Card>

        {/* Timeline */}
        <Card padding="p-6">
          <Timeline
            events={paged}
            selectedId={selectedId}
            onSelect={handleSelect}
            emptyMessage={query || typeFilter !== 'all' ? 'no matching events' : 'no events captured yet'}
          />
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(Math.max(0, page - 1))}
            >
              prev
            </Button>

            <span className="text-xs text-noir-50 lowercase">
              page {page + 1} of {totalPages}
            </span>

            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            >
              next
            </Button>

            <div className="flex items-center gap-1.5 ml-3">
              <input
                type="text"
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleJump()}
                placeholder="go"
                className="w-10 px-2 py-1 rounded-lg border border-noir-10 text-xs text-structure text-center bg-noir-05 focus:outline-none focus:border-signal lowercase"
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
