import { useKeyboard as otUseKeyboard } from '@opentui/react';

type KeyHandler = (key: { name: string; ctrl: boolean; meta: boolean; shift: boolean }) => void;

export function useKlairKeyboard(handlers: Record<string, () => void>): void {
  otUseKeyboard((event) => {
    // Global: Ctrl+Q or Ctrl+C to quit
    if ((event.name === 'q' || event.name === 'c') && (event.ctrl || event.meta)) {
      process.exit(0);
      return;
    }

    // Named handlers
    const handler = handlers[event.name];
    if (handler) {
      handler();
    }
  });
}
