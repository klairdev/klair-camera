import React, { useState } from 'react';
import { useEvents } from '../hooks/use-events';
import { AnimatedPage } from '../components/animations';
import { Card } from '../components/card';
import { Button } from '../components/button';
import { Badge } from '../components/badge';
import { formatTimestamp } from '../utils/format';

interface DiffViewerProps {
  selectedEventId: number | null;
  onBack: () => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ selectedEventId, onBack }) => {
  const { findEvent } = useEvents(247);
  const evt = findEvent(selectedEventId ?? -1);
  const [hideUnchanged, setHideUnchanged] = useState(false);

  if (!evt) {
    return (
      <AnimatedPage>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="w-16 h-16 rounded-full bg-noir-05 flex items-center justify-center">
            <span className="text-2xl text-noir-20">{'\u0394'}</span>
          </div>
          <p className="text-sm text-noir-50 lowercase">select an event from the timeline to view its diff</p>
          <Button variant="secondary" size="sm" onClick={onBack}>
            {'\u2190'} back to timeline
          </Button>
        </div>
      </AnimatedPage>
    );
  }

  const diff = evt.diff;
  const additions = diff.split('\n').filter((l) => l.startsWith('+')).length;
  const deletions = diff.split('\n').filter((l) => l.startsWith('-')).length;

  const lines = diff.split('\n');
  const beforeLines: string[] = [];
  const afterLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('-')) {
      beforeLines.push(line.slice(1));
    } else if (line.startsWith('+')) {
      afterLines.push(line.slice(1));
    } else if (line.startsWith('@@')) {
      beforeLines.push(line);
      afterLines.push(line);
    } else {
      beforeLines.push(line);
      afterLines.push(line);
    }
  }

  return (
    <AnimatedPage>
      <div className="space-y-6">
        {/* Header Card */}
        <Card padding="p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-sm text-noir-50 hover:text-structure transition-colors lowercase flex items-center gap-1.5 shrink-0"
            >
              <span>{'\u2190'}</span>
              <span>back</span>
            </button>
            <div className="w-px h-5 bg-noir-10" />
            <span className="text-xs font-mono text-noir-50">#{evt.id}</span>
            <Badge type={evt.eventType as any} />
            <span className="text-xs font-mono text-structure lowercase truncate flex-1 min-w-0">
              {evt.file}
            </span>
            <span className="text-[11px] text-noir-50 lowercase">
              {formatTimestamp(evt.timestamp)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-noir-05">
            <span className="text-xs text-green-600 font-mono lowercase">+{additions}</span>
            <span className="text-xs text-signal font-mono lowercase">-{deletions}</span>
            <label className="flex items-center gap-2 text-xs text-noir-50 cursor-pointer lowercase ml-auto">
              <input
                type="checkbox"
                checked={hideUnchanged}
                onChange={() => setHideUnchanged(!hideUnchanged)}
                className="rounded border-noir-20"
              />
              hide unchanged
            </label>
          </div>
        </Card>

        {/* Split View */}
        <div className="grid grid-cols-2 gap-4">
          {/* Before */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-noir-50 mb-2 px-1">
              before
            </div>
            <div className="rounded-2xl overflow-hidden border border-red-100 bg-red-50/30">
              <pre className="text-xs font-mono leading-6 m-0 max-h-[60vh] overflow-y-auto">
                {beforeLines.map((line, i) => (
                  <div key={i} className="flex">
                    <span className="select-none text-noir-20 text-right inline-block w-10 shrink-0 pr-3">
                      {i + 1}
                    </span>
                    <span className={line.startsWith('@@') ? 'text-cerulean font-semibold' : lines.some((l) => l.startsWith('-') && l.slice(1) === line) ? 'text-signal' : 'text-noir-50'}>
                      {line}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          </div>

          {/* After */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-noir-50 mb-2 px-1">
              after
            </div>
            <div className="rounded-2xl overflow-hidden border border-blue-100 bg-blue-50/30">
              <pre className="text-xs font-mono leading-6 m-0 max-h-[60vh] overflow-y-auto">
                {afterLines.map((line, i) => (
                  <div key={i} className="flex">
                    <span className="select-none text-noir-20 text-right inline-block w-10 shrink-0 pr-3">
                      {i + 1}
                    </span>
                    <span className={line.startsWith('@@') ? 'text-cerulean font-semibold' : lines.some((l) => l.startsWith('+') && l.slice(1) === line) ? 'text-green-700' : 'text-noir-70'}>
                      {line}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};
