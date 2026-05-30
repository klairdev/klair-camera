import type { Server } from 'node:http';
import type { Session, KlairSettings } from '../shared/types.js';
export declare function startApi(port: number, onSettingsChanged?: (settings: KlairSettings) => Promise<void>, onRestartWatcher?: (newPath: string) => Promise<Session>): Promise<Server>;
//# sourceMappingURL=api.d.ts.map