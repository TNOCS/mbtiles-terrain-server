/// <reference types="node" />
export declare const logger: (verbose: boolean) => {
    info: (msg: any) => void;
    error: (msg: any) => void;
};
export declare const walk: (dir: string, done: (err: NodeJS.ErrnoException, files?: string[]) => void) => void;
export declare const walkTest: (dir: string, regex: RegExp, done: (err: NodeJS.ErrnoException, files?: string[]) => void) => void;
export declare const walkTalk: (dir: string, limit: number, regex: RegExp, process: (file: string) => void, done: (err: NodeJS.ErrnoException, count: number) => void) => Promise<void>;
export declare const tms2slippy: (z: number, y: number) => number;
