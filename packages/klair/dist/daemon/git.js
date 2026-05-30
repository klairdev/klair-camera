import { simpleGit } from 'simple-git';
import { randomUUID } from 'node:crypto';
export async function captureDiff(repoPath, filePath) {
    const git = simpleGit(repoPath);
    try {
        const diffResult = await git.diff([filePath]);
        if (!diffResult) {
            return {
                id: randomUUID(),
                eventId: '',
                content: '',
                filePath,
                linesAdded: 0,
                linesRemoved: 0,
            };
        }
        const lines = diffResult.split('\n');
        let linesAdded = 0;
        let linesRemoved = 0;
        for (const line of lines) {
            if (line.startsWith('+') && !line.startsWith('+++')) {
                linesAdded++;
            }
            else if (line.startsWith('-') && !line.startsWith('---')) {
                linesRemoved++;
            }
        }
        return {
            id: randomUUID(),
            eventId: '',
            content: diffResult,
            filePath,
            linesAdded,
            linesRemoved,
        };
    }
    catch {
        // File might not be tracked by git, return empty diff
        return {
            id: randomUUID(),
            eventId: '',
            content: '',
            filePath,
            linesAdded: 0,
            linesRemoved: 0,
        };
    }
}
export async function isGitRepo(path) {
    try {
        const git = simpleGit(path);
        const status = await git.status();
        return !status.current; // status.current is set even for non-repos in newer simple-git
    }
    catch {
        return false;
    }
}
export async function getRepoInfo(path) {
    try {
        const git = simpleGit(path);
        const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
        const log = await git.log({ maxCount: 5 });
        return {
            branch: branch.trim(),
            recentCommits: log.all.map((c) => ({
                hash: c.hash.substring(0, 7),
                message: c.message.split('\n')[0],
                date: c.date,
                author: c.author_name,
            })),
        };
    }
    catch {
        return null;
    }
}
export async function getStagedDiff(repoPath) {
    try {
        const git = simpleGit(repoPath);
        return await git.diff(['--cached']);
    }
    catch {
        return '';
    }
}
export async function getUnstagedDiff(repoPath) {
    try {
        const git = simpleGit(repoPath);
        return await git.diff();
    }
    catch {
        return '';
    }
}
//# sourceMappingURL=git.js.map