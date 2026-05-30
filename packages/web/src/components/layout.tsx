import React from 'react';
import { Logo } from './logo';
import { StatusDot } from './status-dot';
import type { FrameState } from '../styles/theme';

interface LayoutProps {
  activeView: string;
  onNavigate: (view: string) => void;
  frameState: FrameState;
  children: React.ReactNode;
}

const NAV = [
  { id: 'dashboard', label: 'dashboard', icon: '\u25C7' },
  { id: 'timeline',  label: 'timeline',  icon: '\u2263' },
  { id: 'diff',      label: 'diff',      icon: '\u0394' },
  { id: 'settings',  label: 'settings',  icon: '\u25CE' },
] as const;

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'dashboard',
  timeline: 'timeline',
  diff: 'diff',
  settings: 'settings',
};

export const Layout: React.FC<LayoutProps> = ({ activeView, onNavigate, frameState, children }) => {
  return (
    <div className="app-shell flex min-h-screen">
      {/* Floating Dock Sidebar */}
      <div className="flex items-start pt-6 pl-6">
        <aside className="flex flex-col items-center gap-4 bg-white rounded-dock shadow-lg border border-sidebar px-3 py-6 w-20">
          <button onClick={() => onNavigate('dashboard')} className="mb-1">
            <Logo state={frameState} size={24} />
          </button>

          <div className="w-8 h-px bg-noir-10" />

          {NAV.map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={item.label}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl text-lg transition-all duration-200 ${
                  active
                    ? 'bg-signal text-white shadow-md'
                    : 'text-noir-50 hover:bg-linen hover:text-structure'
                }`}
              >
                {item.icon}
              </button>
            );
          })}

          <div className="flex-1" />

          <StatusDot state={frameState} showLabel={false} size={2} />
        </aside>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-sidebar flex items-center justify-between px-6 shrink-0">
          <h1 className="text-base font-medium text-structure lowercase tracking-[-0.02em]">
            <span className="text-noir-50">klair</span>
            <span className="text-noir-20 mx-1.5">/</span>
            <span>{PAGE_TITLES[activeView] || 'klair'}</span>
          </h1>
          <StatusDot state={frameState} size={3} />
        </header>

        <main className="flex-1 bg-canvas overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
