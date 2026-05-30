import { useSelectionHandler } from '@opentui/react';
import { useState, useCallback } from 'react';
export function useMouse() {
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedText, setSelectedText] = useState('');
    useSelectionHandler((selection) => {
        const text = selection.getSelectedText();
        setSelectedText(text);
        setIsSelecting(text.length > 0);
    });
    const clearSelection = useCallback(() => {
        setSelectedText('');
        setIsSelecting(false);
    }, []);
    return { isSelecting, selectedText, clearSelection };
}
//# sourceMappingURL=use-mouse.js.map