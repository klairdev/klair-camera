import { startApi } from './api.js';
import { initDatabase } from './database.js';
import { initSettings } from './settings.js';
import { startWatcher, applySettings, restartWatcher } from './watcher.js';
import { DAEMON_PORT } from '../shared/constants.js';
async function main() {
    const projectPath = process.env.KLAIR_PROJECT_PATH;
    // Initialize
    await initDatabase();
    await initSettings();
    // Start API server — wire settings changes to watcher reconfiguration
    const server = await startApi(DAEMON_PORT, applySettings, restartWatcher);
    console.log(`KLAIR daemon running on port ${DAEMON_PORT}`);
    // Start file watcher if project path provided
    if (projectPath) {
        await startWatcher(projectPath);
    }
    // Graceful shutdown
    const shutdown = () => {
        server.close(() => {
            process.exit(0);
        });
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}
main().catch((err) => {
    console.error('Daemon failed to start:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map