import React, { useState } from "react";
import { theme } from "../theme";
import { getState, setState } from "../store/app-store";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";

export const Settings: React.FC = () => {
  const { settings } = getState();
  const [target, setTarget] = useState(settings.target);
  const [animate, setAnimate] = useState(settings.animate);
  const [verbose, setVerbose] = useState(settings.verbose);

  const handleSave = () => {
    setState({
      settings: { target, animate, verbose },
    });
    try {
      const settingsPath = path.join(os.homedir(), ".klair", "settings.json");
      fs.writeFileSync(
        settingsPath,
        JSON.stringify({ target, animate, verbose }, null, 2)
      );
    } catch {
      /* best effort */
    }
  };

  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <text fg={theme.cerulean} bold>
        Settings
      </text>
      <box
        flexDirection="column"
        borderStyle="single"
        borderColor={theme.border}
        padding={1}
        marginTop={0}
        gap={1}
      >
        <box flexDirection="row" justifyContent="space-between">
          <text fg={theme.text}>
            Target Directory
          </text>
          <text fg={theme.textMuted}>
            {target}
          </text>
        </box>
        <box flexDirection="row" justifyContent="space-between">
          <text fg={theme.text}>
            Animate
          </text>
          <box
            borderStyle="single"
            borderColor={animate ? theme.success : theme.textDim}
            paddingX={1}
            paddingY={0}
            onClick={() => setAnimate(!animate)}
          >
            <text fg={animate ? theme.success : theme.textMuted}>
              {animate ? "ON" : "OFF"}
            </text>
          </box>
        </box>
        <box flexDirection="row" justifyContent="space-between">
          <text fg={theme.text}>
            Verbose
          </text>
          <box
            borderStyle="single"
            borderColor={verbose ? theme.success : theme.textDim}
            paddingX={1}
            paddingY={0}
            onClick={() => setVerbose(!verbose)}
          >
            <text fg={verbose ? theme.success : theme.textMuted}>
              {verbose ? "ON" : "OFF"}
            </text>
          </box>
        </box>
      </box>
      <box marginTop={1}>
        <box
          borderStyle="single"
          borderColor={theme.accent}
          paddingX={2}
          paddingY={0}
          onClick={handleSave}
        >
          <text fg={theme.accent} bold>
            Save Settings
          </text>
        </box>
      </box>
    </box>
  );
};
