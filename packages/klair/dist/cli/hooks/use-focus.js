import { useFocus as otUseFocus, useBlur as otUseBlur } from '@opentui/react';
import { useState, useCallback } from 'react';
export function useFocus() {
    const [focused, setFocused] = useState(true);
    const onFocus = useCallback((cb) => {
        otUseFocus(() => {
            setFocused(true);
            cb();
        });
    }, []);
    const onBlur = useCallback((cb) => {
        otUseBlur(() => {
            setFocused(false);
            cb();
        });
    }, []);
    return { focused, onFocus, onBlur };
}
//# sourceMappingURL=use-focus.js.map