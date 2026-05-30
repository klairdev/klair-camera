import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const MAX_DIFF_BYTES = 512 * 1024;

async function runGit(cwd, args) {
  const { stdout } = await execFileAsync('git', args, {
    cwd,
    maxBuffer: MAX_DIFF_BYTES,
    timeout: 5000,
  });
  return stdout;
}

/** Best-effort diff for tracked, staged, or untracked files. */
export async function getGitDiff(cwd, relativePath) {
  try {
    const head = await runGit(cwd, ['diff', 'HEAD', '--', relativePath]);
    if (head) return head;

    const staged = await runGit(cwd, ['diff', '--cached', '--', relativePath]);
    if (staged) return staged;

    const nullRef = process.platform === 'win32' ? 'NUL' : '/dev/null';
    try {
      return await runGit(cwd, ['diff', '--no-index', nullRef, relativePath]);
    } catch {
      return '';
    }
  } catch {
    return '';
  }
}
