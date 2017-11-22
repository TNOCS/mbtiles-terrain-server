import { ICommandOptions } from './cli';
export declare class TilesServer {
    private options;
    constructor(options: ICommandOptions);
    private startServer(db, options);
}
