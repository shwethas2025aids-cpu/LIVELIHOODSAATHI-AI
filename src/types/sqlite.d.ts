/**
 * Type declarations for Node.js 22+ native node:sqlite DatabaseSync
 */
declare module 'node:sqlite' {
  export class DatabaseSync {
    constructor(path: string, options?: { open?: boolean; readOnly?: boolean; enableForeignKeyConstraints?: boolean });
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }

  export interface StatementSync {
    run(...params: (string | number | bigint | Buffer | null | undefined)[]): {
      changes: number;
      lastInsertRowid: number | bigint;
    };
    get(...params: (string | number | bigint | Buffer | null | undefined)[]): any;
    all(...params: (string | number | bigint | Buffer | null | undefined)[]): any[];
  }
}

