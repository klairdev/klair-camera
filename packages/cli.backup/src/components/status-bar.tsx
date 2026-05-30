import React, { useState, useEffect } from "react";
import { theme } from "../theme";
import { getState, subscribe } from "../store/app-store";

export const StatusBar: React.FC = () => {
  const [toast, setToast] = useState<string | null>(getState().toastMessage);
  const [state, setState] = useState(getState());

  useEffect(() => subscribe((state) => {
    setToast(state.toastMessage);
    setState(state);
  }), []);

  return (
    <box flexDirection="row" justifyContent="space-between" height={1}
      borderStyle="single" borderColor={theme.border}
      paddingX={2} backgroundColor={theme.bgElevated}
    >
      {toast ? (
        <text fg={theme.success}>{toast}</text>
      ) : (
        <text fg={theme.textDim}>
          / commands · arrows · enter · esc · ? help · q quit
        </text>
      )}
      <text fg={state.daemonRunning ? theme.success : theme.textDim}>
        {state.daemonRunning ? "ready" : "stopped"}
      </text>
    </box>
  );
};
