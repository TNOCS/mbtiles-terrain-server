import * as genericPool from 'generic-pool';
import * as sqlite3 from 'sqlite3';
export declare const createPool: (filename: string, mode: number, synchronous?: boolean) => genericPool.Pool<sqlite3.Database>;
