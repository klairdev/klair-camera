import React, { useState, useEffect } from "react";
import { theme } from "../theme";
import { KLAIR_LOGO } from "../utils/logo";

export const Startup: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [showLogo, setShowLogo] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowLogo(true), 100);
    const t2 = setTimeout(() => setShowSubtitle(true), 600);
    const t3 = setTimeout(() => onComplete(), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <box flexDirection="column" flexGrow={1} alignItems="center" justifyContent="center">
      {showLogo && (
        <box flexDirection="column" alignItems="center">
          {KLAIR_LOGO.split('\n').map((line, i) => (
            <text key={i} fg={theme.accent} bold>
              {line}
            </text>
          ))}
        </box>
      )}
      {showSubtitle && (
        <box marginTop={1}>
          <text fg={theme.text} bold>
            KLAIR watch
          </text>
        </box>
      )}
    </box>
  );
};