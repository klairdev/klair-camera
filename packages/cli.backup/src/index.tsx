#!/usr/bin/env bun
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import React from "react";
import { App } from "./app";
import { getState } from "./store/app-store";
import { execSync } from "node:child_process";

async function main() {
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
  });

  // Kill daemon on exit (Ctrl+C or renderer destroy)
  renderer.on("exit", () => {
    try {
      const s = getState();
      if (s.daemonPid) {
        if (process.platform === "win32") {
          execSync(`taskkill /F /PID ${s.daemonPid}`, { stdio: "ignore" });
        } else {
          process.kill(s.daemonPid, "SIGTERM");
        }
      }
    } catch { /* already gone */ }
  });

  createRoot(renderer).render(<App />);
}

main();
