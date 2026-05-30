import { useFocus as otUseFocus, useBlur as otUseBlur } from '@opentui/react';
import { useState, useCallback } from 'react';

export function useFocus(): { focused: boolean; onFocus: (cb: () => void) => void; onBlur: (cb: () => void) => void } {
  const [focused, setFocused] = useState(true);

  const onFocus = useCallback((cb: () => void) => {
    otUseFocus(() => {
      setFocused(true);
      cb();
    });
  }, []);

  const onBlur = useCallback((cb: () => void) => {
    otUseBlur(() => {
      setFocused(false);
      cb();
    });
  }, []);

  return { focused, onFocus, onBlur };
}
