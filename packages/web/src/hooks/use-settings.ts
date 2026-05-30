import { useState, useEffect, useCallback } from 'react';

export interface AppSettings {
  targetDir: string;
  animate: boolean;
  verbose: boolean;
  autoScroll: boolean;
  theme: 'light' | 'dark';
}

const STORAGE_KEY = 'klair-settings';

const DEFAULTS: AppSettings = {
  targetDir: '~/projects/ai-agent',
  animate: true,
  verbose: false,
  autoScroll: true,
  theme: 'light',
};

const PERSIST_KEYS: (keyof AppSettings)[] = ['animate', 'verbose', 'autoScroll', 'theme'];

function load(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

function save(settings: AppSettings): void {
  const subset: Partial<AppSettings> = {};
  for (const key of PERSIST_KEYS) {
    (subset as any)[key] = settings[key];
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subset));
  } catch { /* quota exceeded — ignore */ }
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(load);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      save(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSettings({ ...DEFAULTS });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { settings, update, reset };
}
