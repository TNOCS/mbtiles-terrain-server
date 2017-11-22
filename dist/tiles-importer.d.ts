import { ICommandOptions } from './cli';
export declare class TilesImporter {
    private options;
    private log;
    constructor(options: ICommandOptions);
    private process();
    private importFiles2(db, files, regex);
    private initDatabase(mbtiles);
}
