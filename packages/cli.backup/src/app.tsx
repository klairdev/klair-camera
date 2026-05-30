import React, { useState, useEffect } from "react";
import { Startup } from "./components/startup";
import { Header } from "./components/header";
import { Dashboard } from "./components/dashboard";
import { Events } from "./components/events";
import { DiffViewer } from "./components/diff-viewer";
import { Settings } from "./components/settings";
import { StatusBar } from "./components/status-bar";
import { CommandPalette, HelpOverlay } from "./components/command-palette";
import { subscribe, type View } from "./store/app-store";
import { useKeymap } from "./hooks/use-keymap";

export const App: React.FC = () => {
  const [showStartup, setShowStartup] = useState(true);
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useKeymap();

  useEffect(() => {
    return subscribe((state) => {
      setCurrentView(state.view);
      setCommandPaletteOpen(state.commandPaletteOpen);
      setHelpOpen(state.helpOpen);
    });
  }, []);

  if (showStartup) {
    return <Startup onComplete={() => setShowStartup(false)} />;
  }

  return (
    <box flexDirection="column" flexGrow={1}>
      <Header />
      <box flexGrow={1}>
        {currentView === "dashboard" && <Dashboard />}
        {currentView === "events" && <Events />}
        {currentView === "diff" && <DiffViewer />}
        {currentView === "settings" && <Settings />}
      </box>
      <StatusBar />
      {commandPaletteOpen && <CommandPalette />}
      {helpOpen && <HelpOverlay />}
    </box>
  );
};
