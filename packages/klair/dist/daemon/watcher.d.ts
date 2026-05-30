import { type FSWatcher } from 'chokidar';
import type { Session, KlairSettings } from '../shared/types.js';
export declare function startWatcher(projectPath: string): Promise<{
    session: Session;
    watcher: FSWatcher;
}>;
export declare function applySettings(_newSettings: KlairSettings): Promise<void>;
export declare function restartWatcher(newPath: string): Promise<Session>;
//# sourceMappingURL=watcher.d.ts.map