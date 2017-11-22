import * as fs from 'fs';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';
import * as ProgressBar from 'progress';
import { Database } from 'sqlite3';
import { eachLimit } from 'async';
import { ICommandOptions } from './cli';
import { logger, walk, tms2slippy, walkTest, walkTalk } from './utils';
import { createPool } from './poolboy';

export class TilesImporter {
  private log: {
    info: (msg: any) => void;
    error: (msg: any) => void;
  };

  constructor(private options: ICommandOptions) {
    this.log = logger(options.verbose);
    this.process();
  }

  private async process() {
    const regex = path.sep === '\\' ? /\\(\d+)\\(\d+)\\(\d+)\./ : /\/(\d+)\/(\d+)\/(\d+)\./;
    const mbtiles = await this.initDatabase(this.options.src);
    const isTms = this.options.format === 'tms';

    const ready = () => {
      this.log.info('Finished processing all files...');
      this.log.info(`Unprocessed ${unprocessedFiles}, allready processed ${processedFiles} files.`);
    };

    const myPool = createPool(mbtiles, sqlite3.OPEN_READWRITE, true);

    let unprocessedFiles = 0;
    let processedFiles = 0;
    const processFile = async (f: string) => {
      return new Promise((resolve, reject) => {
        unprocessedFiles++;
        const m = regex.exec(f);
        const z = +m[1];
        const x = +m[2];
        const y = isTms ? +m[3] : tms2slippy(z, +m[3]);
        fs.readFile(f, (err, data) => {
          if (!err) {
            myPool.acquire().then(db => {
              db.run('INSERT INTO tiles(zoom_level, tile_column, tile_row, tile_data) VALUES (?, ?, ?, ?)', z, x, y, data, () => {
                processedFiles++;
                myPool.release(db);
                if (processedFiles >= unprocessedFiles) { ready(); }
                resolve();
              });
            });
          } else {
            processedFiles++;
            resolve();
          }
        });
      });
    };

    // const myPool = createPool(mbtiles, sqlite3.OPEN_READWRITE);
    // this.walkTalk(this.options.input, myPool, () => this.log.info('DONE'));
    this.log.info(`Reading all files in ${this.options.input}...`);
    console.time('Processing');
    walkTalk(this.options.input, 100, regex, processFile, (err, count) => {
      this.log.info(`Found ${count} files, allready processed ${processedFiles} files.`);
      console.timeEnd('Processing');
    });
  }

  private async importFiles2(db: Database, files: string[], regex: RegExp) {
    this.log.info(`Extracting zoom, x and y...`);
    const isTms = this.options.format === 'tms';

    const validFiles = files.filter(f => regex.test(f)).map(f => {
      const m = regex.exec(f);
      const z = +m[1];
      const x = +m[2];
      const y = isTms ? +m[3] : tms2slippy(z, +m[3]);
      return { z, x, y, f };
    });
    let filesToBeProcessed = validFiles.length;
    const bar = new ProgressBar('  :current of :total :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 40,
      total: filesToBeProcessed
    });

    this.log.info(`Found ${filesToBeProcessed} files: processing started...`);

    const stmt = db.prepare('INSERT INTO tiles(zoom_level, tile_column, tile_row, tile_data) VALUES (?, ?, ?, ?)');
    console.time('Processing');
    eachLimit(validFiles, 100, (vf, done) => {
      const { x, y, z, f } = vf;
      fs.readFile(f, (err, data) => {
        filesToBeProcessed--;
        bar.tick(1);
        if (err) { return this.log.error(err); }
        stmt.run(z, x, y, data);
        if (filesToBeProcessed <= 0) {
          stmt.finalize();
          console.timeEnd('Processing');
        }
        done();
      });
    }, err => {
      if (err) {
        this.log.error(err);
        process.exit(1);
      }
      this.log.info('DONE');
      db.close();
      process.exit(0);
    });
  }

  private async initDatabase(mbtiles: string) {
    mbtiles = path.resolve(mbtiles);
    if (fs.existsSync(mbtiles)) {
      // TODO remove - only for testing.
      // fs.unlinkSync(mbtiles);
      throw new Error(`Database ${mbtiles} already exists - cannot append!`);
    }

    return new Promise<string>((resolve, reject) => {
      const db = new Database(mbtiles, (err) => {
        if (err) { throw new Error(err.message); }
        this.log.info(`Connected to ${mbtiles} database.`);
        db.run(`CREATE TABLE metadata (name text, value text)`, (result, err2) => {
          if (err2) { throw new Error(err2.message); }
          const stmt = db.prepare('INSERT INTO metadata(name, value) VALUES (?, ?)');
          stmt.run('name', path.basename(mbtiles));
          stmt.run('type', 'baselayer');
          stmt.run('version', 1);
          stmt.run('description', 'A set of tiles: it was created to serve Cesium v1 height tiles');
          stmt.run('format', 'unknown');
          stmt.run('tms', this.options.format === 'tms');
          stmt.finalize();
          db.run('CREATE TABLE tiles (zoom_level integer, tile_column integer, tile_row integer, tile_data blob)');
          db.close();
          resolve(mbtiles);
        });
      });
    });
  }
}