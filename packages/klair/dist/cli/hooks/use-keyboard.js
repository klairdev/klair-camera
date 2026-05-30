import { useKeyboard as otUseKeyboard } from '@opentui/react';
export function useKlairKeyboard(handlers) {
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
//# sourceMappingURL=use-keyboard.js.map