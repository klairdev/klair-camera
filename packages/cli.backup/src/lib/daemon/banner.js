import { playWelcomeSequence } from './ui/anim.js';
import { renderWelcomePanel } from './ui/mascot.js';
import { phraseRandom } from './ui/phrases.js';
import { paint } from './ui/theme.js';

export async function printBanner({ compact = false, animate = false } = {}) {
  if (process.env.KLAIR_NO_BANNER) return;

  if (compact) {
    console.log('');
    console.log(paint.accent('✱') + paint.dim('  klair'));
    console.log('');
    return;
  }

  if (animate) {
    await playWelcomeSequence({ cwd: process.cwd() });
    return;
  }

  console.log('');
  for (const line of renderWelcomePanel({
    cwd: process.cwd(),
    status: phraseRandom('idle'),
  })) {
    console.log(line);
  }
  console.log('');
}
