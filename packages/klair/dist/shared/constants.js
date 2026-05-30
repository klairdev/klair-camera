const home = process.env.HOME || process.env.USERPROFILE || '/tmp';
export const KLAIR_DIR = `${home}/.klair`;
export const DB_PATH = `${KLAIR_DIR}/klair.db`;
export const DAEMON_PORT = parseInt(process.env.KLAIR_DAEMON_PORT || '4200', 10);
export const DAEMON_URL = `http://localhost:${DAEMON_PORT}`;
export const DEFAULT_SETTINGS = {
    watchDebounceMs: 300,
    maxEventsPerSession: 10000,
    ignorePatterns: ['node_modules', '.git', 'dist', '.klair', '__pycache__', '*.log'],
    theme: 'dark',
    autoStart: true,
};
//# sourceMappingURL=constants.js.map