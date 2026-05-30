import React from "react";
import { theme } from "../theme";
import type { View } from "../store/app-store";

interface SidebarProps {
  activeView: View;
  onSelect: (view: View) => void;
}

const NAV_ITEMS: { view: View; label: string; key: string }[] = [
  { view: "dashboard", label: "Dashboard", key: "1" },
  { view: "events", label: "Events", key: "2" },
  { view: "diff", label: "Diff", key: "3" },
  { view: "settings", label: "Settings", key: "4" },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onSelect }) => {
  return (
    <box
      flexDirection="column"
      width={16}
      borderStyle="single"
      borderColor={theme.border}
      paddingY={1}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeView === item.view;
        return (
          <box
            key={item.view}
            paddingX={2}
            paddingY={0}
            backgroundColor={isActive ? theme.bgActive : undefined}
            onClick={() => onSelect(item.view)}
          >
            <text
              fg={isActive ? theme.accent : theme.textMuted}
              bold={isActive}
            >
              {item.key}. {item.label}
            </text>
          </box>
        );
      })}
    </box>
  );
};
