import type { Diff } from '../shared/types.js';
export declare function captureDiff(repoPath: string, filePath: string): Promise<Diff>;
export declare function isGitRepo(path: string): Promise<boolean>;
export declare function getRepoInfo(path: string): Promise<{
    branch: string;
    recentCommits: {
        hash: string;
        message: string;
        date: string;
        author: string;
    }[];
} | null>;
export declare function getStagedDiff(repoPath: string): Promise<string>;
export declare function getUnstagedDiff(repoPath: string): Promise<string>;
//# sourceMappingURL=git.d.ts.map