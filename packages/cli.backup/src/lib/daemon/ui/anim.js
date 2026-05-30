import { setTimeout as sleep } from 'node:timers/promises';
import { phraseRandom } from './phrases.js';
import { renderLogo, renderWelcomeWindow, renderTips, renderWelcomePanel } from './mascot.js';
import { paint, isTty } from './theme.js';

const HEADER_LINE = 1;

export function canAnimate() {
  return isTty() && !process.env.KLAIR_NO_ANIM;
}

function cursorUp(n) {
  if (n > 0) process.stdout.write(`\x1b[${n}A`);
}

function cursorDown(n) {
  if (n > 0) process.stdout.write(`\x1b[${n}B`);
}

function writeLine(text) {
  process.stdout.write('\x1b[2K' + text + '\n');
}

function headerLine(text) {
  return (
    paint.dim('│') +
    `  ${paint.accent('✱')}  ${paint.accent(text)}` +
    ' '.repeat(Math.max(0, 55 - 4 - 2 - text.length)) +
    paint.dim('│')
  );
}

const TOTAL_PANEL_LINES = 11 + 8 + 6;

export async function playWelcomeSequence({ cwd } = {}) {
  if (!canAnimate()) {
    console.log('');
    for (const line of renderWelcomePanel({ cwd })) {
      console.log(line);
    }
    console.log('');
    return;
  }

  console.log('');

  for (const line of renderLogo()) {
    console.log(line);
  }

  const windowLines = renderWelcomeWindow({ cwd });
  for (const line of windowLines) {
    console.log(line);
  }

  for (const line of renderTips()) {
    console.log(line);
  }
  console.log('');

  const phrases = [
    phraseRandom('startup'),
    phraseRandom('thinking'),
    phraseRandom('success'),
  ];

  for (const phrase of phrases) {
    await sleep(320);
    cursorUp(TOTAL_PANEL_LINES);
    writeLine(headerLine(phrase));
    cursorDown(TOTAL_PANEL_LINES - 1);
  }
}

export async function flashState(message, { frameMs = 90 } = {}) {
  if (!canAnimate()) return;
  cursorUp(TOTAL_PANEL_LINES);
  writeLine(headerLine(message));
  cursorDown(TOTAL_PANEL_LINES - 1);
  await sleep(frameMs);
}
