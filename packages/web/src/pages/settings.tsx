import React, { useState } from 'react';
import { AnimatedPage } from '../components/animations';
import { Card } from '../components/card';
import { Button } from '../components/button';
import { Toggle } from '../components/toggle';
import { Input } from '../components/input';
import { useSettings } from '../hooks/use-settings';

export const Settings: React.FC = () => {
  const { settings, update, reset } = useSettings();
  const [saved, setSaved] = useState(false);
  const [dirValue, setDirValue] = useState(settings.targetDir);

  const handleSave = () => {
    update({ targetDir: dirValue });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    reset();
    setDirValue('~/projects/ai-agent');
  };

  return (
    <AnimatedPage>
      <div className="max-w-lg mx-auto space-y-6">
        {/* Watch Configuration */}
        <Card>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-noir-50 mb-1">
            watch configuration
          </h2>
          <p className="text-xs text-noir-50 lowercase mb-6">configure what klair monitors</p>

          <Input
            label="target directory"
            value={dirValue}
            onChange={setDirValue}
            placeholder="~/projects/my-app"
            icon={'\uD83D\uDCC1'}
            mono
          />
          <p className="text-[11px] text-noir-50 lowercase mt-1.5 mb-4">the directory klair monitors for changes</p>

          <Button variant="secondary" size="sm" onClick={() => setDirValue('~/projects/ai-agent')}>
            use home directory
          </Button>
        </Card>

        {/* Behavior */}
        <Card>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-noir-50 mb-1">
            behavior
          </h2>
          <p className="text-xs text-noir-50 lowercase mb-6">toggle features and logging</p>

          <div className="space-y-5">
            <Toggle
              checked={settings.animate}
              onChange={() => update({ animate: !settings.animate })}
              label="animate on new events"
              description="shows animation when events arrive"
            />
            <Toggle
              checked={settings.verbose}
              onChange={() => update({ verbose: !settings.verbose })}
              label="verbose logging"
              description="logs detailed operation info"
            />
            <Toggle
              checked={settings.autoScroll}
              onChange={() => update({ autoScroll: !settings.autoScroll })}
              label="auto-scroll timeline"
              description="automatically scroll to newest event"
            />
          </div>
        </Card>

        {/* Theme */}
        <Card>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-noir-50 mb-1">
            theme
          </h2>
          <p className="text-xs text-noir-50 lowercase mb-6">choose your interface theme</p>

          <div className="flex gap-4">
            {(['light', 'dark'] as const).map((t) => (
              <label
                key={t}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all lowercase ${
                  settings.theme === t
                    ? 'border-signal bg-red-50 text-signal'
                    : 'border-noir-10 text-noir-50 hover:bg-noir-05'
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  checked={settings.theme === t}
                  onChange={() => update({ theme: t })}
                  className="sr-only"
                />
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  settings.theme === t ? 'border-signal' : 'border-noir-20'
                }`}>
                  {settings.theme === t && <span className="w-2 h-2 rounded-full bg-signal" />}
                </span>
                <span className="text-sm font-medium">{t}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <Card>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-noir-50 mb-1">
            actions
          </h2>
          <p className="text-xs text-noir-50 lowercase mb-6">save or reset configuration</p>

          <div className="flex flex-col gap-3">
            <Button variant="primary" fullWidth onClick={handleSave}>
              save settings
            </Button>
            <Button variant="secondary" fullWidth onClick={handleReset}>
              reset to defaults
            </Button>
          </div>

          {saved && (
            <p className="text-xs text-green-700 lowercase mt-3 flex items-center gap-1.5">
              <span>{'\u2713'}</span>
              settings saved successfully
            </p>
          )}
        </Card>
      </div>
    </AnimatedPage>
  );
};
