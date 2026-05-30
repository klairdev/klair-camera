import { setTimeout as sleep } from 'node:timers/promises';
import { paint } from './theme.js';

/** Progressive line output — calm pacing */
export async function streamLines(lines, { delayMs = 28 } = {}) {
  for (const line of lines) {
    console.log(line);
    if (delayMs > 0) await sleep(delayMs);
  }
}

export async function streamStatusSteps(steps, { delayMs = 320 } = {}) {
  for (const step of steps) {
    process.stdout.write('\x1b[2K' + paint.muted(step) + '\n');
    await sleep(delayMs);
  }
}

export function clearLine() {
  process.stdout.write('\x1b[2K\r');
}
