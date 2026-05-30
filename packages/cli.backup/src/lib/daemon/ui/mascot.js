import { paint } from './theme.js';

const ASCII_LOGO = [
  ' █████   ████ █████         █████████   █████ ███████████  ',
  '░░███   ███░ ░░███         ███░░░░░███ ░░███ ░░███░░░░░███ ',
  ' ░███  ███    ░███        ░███    ░███  ░███  ░███    ░███ ',
  ' ░███████     ░███        ░███████████  ░███  ░██████████  ',
  ' ░███░░███    ░███        ░███░░░░░███  ░███  ░███░░░░░███ ',
  ' ░███ ░░███   ░███      █ ░███    ░███  ░███  ░███    ░███ ',
  ' █████ ░░████ ███████████ █████   █████ █████ █████   █████',
  '░░░░░   ░░░░ ░░░░░░░░░░░ ░░░░░   ░░░░░ ░░░░░ ░░░░░   ░░░░░ ',
  '                                                            ',
  '                                                            ',
  '                                                            ',
];

const WIN_INNER = 55;
const WIN_PAD = ' '.repeat(WIN_INNER);

export function renderLogo() {
  return ASCII_LOGO.map((line) => paint.cerulean(line));
}

function shortPath(p) {
  const home = process.env.USERPROFILE || process.env.HOME || '';
  if (home && p.startsWith(home)) {
    return '~' + p.slice(home.length);
  }
  return p;
}

export function renderWelcomeWindow({ cwd = process.cwd(), status = '' } = {}) {
  const border = '─'.repeat(WIN_INNER);
  const display = status || 'Welcome to Klair Watch';
  const headerLine =
    paint.dim('│') +
    `  ${paint.accent('✱')}  ${paint.accent(display)}` +
    ' '.repeat(Math.max(0, WIN_INNER - 4 - 2 - display.length)) +
    paint.dim('│');

  return [
    paint.dim(`┌${border}┐`),
    headerLine,
    paint.dim('│') + WIN_PAD + paint.dim('│'),
    paint.dim('│') +
      `  ${paint.muted("You're currently watching:")}` +
      ' '.repeat(Math.max(0, WIN_INNER - 2 - "You're currently watching:".length - 2)) +
      paint.dim('│'),
    paint.dim('│') +
      `  ${paint.muted('cwd:')} ${paint.white(shortPath(cwd))}` +
      ' '.repeat(Math.max(0, WIN_INNER - 2 - 4 - shortPath(cwd).length - 2)) +
      paint.dim('│'),
    paint.dim('│') + WIN_PAD + paint.dim('│'),
    paint.dim('│') +
      `  ${paint.muted('Type')} ${paint.white('/help')} ${paint.muted('for commands')} ${paint.dim('·')} ${paint.muted('/status for session')}` +
      ' '.repeat(Math.max(0, WIN_INNER - 2 - "Type /help for commands · /status for session".length - 2)) +
      paint.dim('│'),
    paint.dim(`└${border}┘`),
  ];
}

export function renderTips() {
  return [
    '',
    `${paint.accent('✱')} ${paint.accent('Getting Started:')}`,
    `  ${paint.muted('•')} ${paint.muted('Run')} ${paint.white('/watch [path]')} ${paint.muted('to start capturing')}`,
    `  ${paint.muted('•')} ${paint.muted('Use')} ${paint.white('/last')} ${paint.muted('to see recent events')}`,
    `  ${paint.muted('•')} ${paint.muted('Try')} ${paint.white('/pulse')} ${paint.muted('to check session health')}`,
    `  ${paint.muted('•')} ${paint.muted('Type')} ${paint.white('/config')} ${paint.muted('to adjust preferences')}`,
  ];
}

export function renderWelcomePanel({ cwd, status = '' } = {}) {
  return [
    ...renderLogo(),
    ...renderWelcomeWindow({ cwd, status }),
    ...renderTips(),
  ];
}
