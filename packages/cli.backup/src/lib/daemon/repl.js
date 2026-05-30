import readline from 'node:readline';
import {
  fetchEvents,
  formatStatus,
  getTarget,
  setTarget,
  startDaemon,
  stopDaemon,
  resetSession,
  configInteractive,
} from './commands.js';
import { loadSettings, saveSettings } from './settings.js';
import { playWelcomeSequence, flashState } from './ui/anim.js';
import { box } from './ui/layout.js';
import { phraseRandom } from './ui/phrases.js';
import { streamLines } from './ui/stream.js';
import { paint } from './ui/theme.js';

const SLASH_COMMANDS = [
  '/help',
  '/pulse',
  '/status',
  '/target',
  '/target change',
  '/watch',
  '/start',
  '/stop',
  '/last',
  '/see',
  '/events',
  '/reset',
  '/config',
  '/settings',
  '/clear',
  '/exit',
  '/quit',
];

const HELP = box('Commands', [
  '/help              Show this guide',
  '/pulse             Session overview',
  '/target            Show watch folder',
  '/target change <path>   Set watch folder',
  '/watch [path]      Start capturing',
  '/stop              Stop camera',
  '/last [n]          Recent file events',
  '/reset             Clear session data',
  '/config            Preferences',
  '/clear             Clear screen',
  '/exit              Leave klair',
]);

function completer(line) {
  const hits = SLASH_COMMANDS.filter((c) => c.startsWith(line.trim()));
  return [hits.length ? hits : SLASH_COMMANDS, line];
}

function deprecationNotice(oldName, newName) {
  console.log(paint.warning(`ℹ "${oldName}" is now "${newName}"`));
  console.log('');
}

async function runSlash(raw) {
  const parts = raw.trim().split(/\s+/u);
  const cmd = parts[0].toLowerCase();
  const rest = parts.slice(1).join(' ');

  switch (cmd) {
    case '/help':
      await streamLines(HELP, { delayMs: 0 });
      return;

    case '/clear':
      console.clear();
      return;

    case '/exit':
    case '/quit':
      await flashState(phraseRandom('goodbye'));
      console.log(paint.muted('Goodbye.'));
      process.exit(0);

    case '/pulse':
      await streamLines(formatStatus(), { delayMs: 12 });
      return;

    case '/status':
      deprecationNotice('/status', '/pulse');
      await streamLines(formatStatus(), { delayMs: 12 });
      return;

    case '/target':
      if (parts[1] === 'change' && parts[2]) {
        const p = setTarget(parts.slice(2).join(' '));
        await flashState(phraseRandom('success'));
        console.log(paint.muted(`Target set to ${p}`));
        return;
      }
      console.log(paint.muted(`Target: ${getTarget()}`));
      return;

    case '/watch': {
      await flashState(phraseRandom('startup'));
      const { pid, root } = startDaemon(rest || undefined);
      await flashState(phraseRandom('success'));
      console.log('');
      console.log(paint.muted(`Watching ${root}`));
      console.log(paint.dim(`pid ${pid}`));
      console.log('');
      return;
    }

    case '/start':
      deprecationNotice('/start', '/watch');
      await flashState(phraseRandom('startup'));
      const { pid, root } = startDaemon(rest || undefined);
      await flashState(phraseRandom('success'));
      console.log('');
      console.log(paint.muted(`Watching ${root}`));
      console.log(paint.dim(`pid ${pid}`));
      console.log('');
      return;

    case '/stop':
      await flashState(phraseRandom('thinking'));
      stopDaemon();
      await flashState(phraseRandom('success'));
      console.log('');
      return;

    case '/last': {
      const n = Math.min(Math.max(parseInt(parts[1], 10) || 10, 1), 100);
      const events = fetchEvents(n);
      if (!events.length) {
        console.log(paint.muted('No events yet.'));
        return;
      }
      console.log('');
      for (const e of events) {
        const when = new Date(e.timestamp).toLocaleString();
        console.log(
          paint.dim(`#${e.id}`) +
            paint.muted(`  ${when}  `) +
            paint.accent(e.eventType) +
            paint.white(`  ${e.file}`)
        );
      }
      console.log('');
      return;
    }

    case '/see':
      deprecationNotice('/see', '/last');
    case '/events': {
      const n = Math.min(Math.max(parseInt(parts[1], 10) || 10, 1), 100);
      const events = fetchEvents(n);
      if (!events.length) {
        console.log(paint.muted('No events yet.'));
        return;
      }
      console.log('');
      for (const e of events) {
        const when = new Date(e.timestamp).toLocaleString();
        console.log(
          paint.dim(`#${e.id}`) +
            paint.muted(`  ${when}  `) +
            paint.accent(e.eventType) +
            paint.white(`  ${e.file}`)
        );
      }
      console.log('');
      return;
    }

    case '/reset':
      await flashState('Clearing session…');
      resetSession();
      await flashState(phraseRandom('success'));
      console.log(paint.muted('Session cleared. Config preserved.'));
      console.log('');
      return;

    case '/config':
      await configInteractive();
      return;

    case '/settings':
      deprecationNotice('/settings', '/config');
      await configInteractive();
      return;

    default:
      console.log(paint.warning("Couldn't resolve that command."));
      console.log(paint.dim('Try /help'));
  }
}

export async function startRepl() {
  await playWelcomeSequence({ cwd: process.cwd() });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer,
    prompt: 'klair › ',
  });

  console.log(paint.dim('Type /help for commands · Tab to complete'));
  console.log('');

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }

    try {
      if (input.startsWith('/')) {
        await runSlash(input);
      } else if (input === 'exit' || input === 'quit') {
        await runSlash('/exit');
      } else {
        console.log(paint.dim('Use /commands — try /help'));
      }
    } catch (err) {
      await flashState(phraseRandom('error'));
      console.log(paint.error(err.message));
      console.log('');
    }

    rl.setPrompt('klair › ');
    rl.prompt();
  });

  rl.on('close', () => {
    console.log('');
    process.exit(0);
  });
}
