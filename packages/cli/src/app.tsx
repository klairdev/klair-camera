import React, { useState, useEffect } from "react";
import { theme } from "./theme";
import { Startup } from "./components/startup";
import { Header } from "./components/header";
import { Sidebar } from "./components/sidebar";
import { Dashboard } from "./components/dashboard";
import { Events } from "./components/events";
import { DiffViewer } from "./components/diff-viewer";
import { Settings } from "./components/settings";
import { StatusBar } from "./components/status-bar";
import { CommandPalette } from "./components/command-palette";
import { getState, setState, subscribe, type View } from "./store/app-store";
import { useKeymap } from "./hooks/use-keymap";
import { useDaemonStatus } from "./hooks/use-api";

export const App: React.FC = () => {
  const [showStartup, setShowStartup] = useState(true);
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { running } = useDaemonStatus();

  useKeymap();

  useEffect(() => {
    const unsubscribe = subscribe((state) => {
      setCurrentView(state.view);
      setCommandPaletteOpen(state.commandPaletteOpen);
    });
    return unsubscribe;
  }, []);

  const handleStartupComplete = () => {
    setShowStartup(false);
  };

  const handleSelect = (view: View) => {
    setState({ view });
  };

  if (showStartup) {
    return <Startup onComplete={handleStartupComplete} />;
  }

  return (
    <box flexDirection="column" flexGrow={1}>
      <Header daemonRunning={running} />
      <box flexDirection="row" flexGrow={1}>
        <Sidebar activeView={currentView} onSelect={handleSelect} />
        <box flexDirection="column" flexGrow={1}>
          {currentView === "dashboard" && <Dashboard />}
          {currentView === "events" && <Events />}
          {currentView === "diff" && <DiffViewer />}
          {currentView === "settings" && <Settings />}
        </box>
      </box>
      <StatusBar />
      {commandPaletteOpen && <CommandPalette />}
    </box>
  );
};
