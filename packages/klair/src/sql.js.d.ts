declare module 'sql.js' {
  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }

  interface QueryExecResult {
    columns: string[];
    values: SqlValue[][];
  }

  type SqlValue = number | string | Uint8Array | null;

  interface Database {
    run(sql: string, params?: unknown[]): Database;
    exec(sql: string, params?: unknown[]): QueryExecResult[];
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }

  interface Statement {
    bind(params?: unknown[]): boolean;
    step(): boolean;
    getAsObject(): Record<string, SqlValue>;
    free(): boolean;
  }

  export default function initSqlJs(config?: Record<string, unknown>): Promise<SqlJsStatic>;
  export type { Database, SqlJsStatic, QueryExecResult, SqlValue, Statement };
}
