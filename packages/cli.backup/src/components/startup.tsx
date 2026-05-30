import React, { useState, useEffect } from "react";
import { useTimeline } from "@opentui/react";
import { theme } from "../theme";
import { renderPixelLogo } from "../utils/logo-pixel";
import { Spinner } from "./spinner";

interface StartupProps {
  onComplete: () => void;
}

export const Startup: React.FC<StartupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [fadeIn, setFadeIn] = useState(0);

  // Smooth fade-in using native OpenTUI animation
  const timeline = useTimeline({ duration: 2500, loop: false });

  useEffect(() => {
    timeline.add(
      { fadeIn },
      {
        fadeIn: 1,
        duration: 2500,
        ease: "easeOut",
        onUpdate: (anim) => {
          setFadeIn(anim.targets[0].fadeIn);
        },
      },
    );
  }, []);

  // Step timeline for sequential status messages
  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setStep(1), 300));
    t.push(setTimeout(() => setStep(2), 900));
    t.push(setTimeout(() => setStep(3), 1500));
    t.push(setTimeout(() => setStep(4), 2100));
    t.push(setTimeout(() => onComplete(), 2800));
    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <box flexDirection="column" flexGrow={1} alignItems="center" justifyContent="center" gap={2}>
      {/* KLAIR pixel logo */}
      {step >= 1 && renderPixelLogo().map((line, i) => (
        <text key={i} fg={theme.accent} bold>{line}</text>
      ))}

      {/* Tagline */}
      {step >= 1 && (
        <box flexDirection="column" alignItems="center">
          <text fg={theme.cerulean} bold>
            observing the agent era
          </text>
        </box>
      )}

      {/* Status messages */}
      <box flexDirection="column" alignItems="flex-start" gap={0}>
        {step >= 2 && <Spinner label="initializing..." color={theme.cerulean} />}
        {step >= 3 && <text fg={theme.success}>  daemon started</text>}
        {step >= 4 && <text fg={theme.success}>  watching {process.cwd().split("/").pop() || process.cwd().split("\\").pop()}</text>}
      </box>

      {/* Footer hint */}
      {step >= 4 && (
        <box marginTop={1}>
          <text fg={theme.textDim}>
            / commands  arrow keys navigate  enter select  esc back  q quit
          </text>
        </box>
      )}
    </box>
  );
};
