import { Database } from 'sqlite3';
import { tms2slippy } from './utils';
import * as path from 'path';
import * as express from 'express';
import * as cors from 'cors';
import * as zlib from 'zlib';
import { ICommandOptions } from './cli';
import { Response } from 'express-serve-static-core';

export class TilesServer {
  constructor(private options: ICommandOptions) {
    const db = new Database(options.src, (err) => {
      this.startServer(db, options);
    });
  }

  private startServer(db: Database, options: ICommandOptions) {
    const httpPort = options.port || process.env.PORT || 8123;
    const app = express();
    const query = (z: number, x: number, y: number) => `SELECT tile_data FROM tiles WHERE zoom_level = ${z} AND tile_column = ${x} AND tile_row = ${y}`;
    if (options.cors) { app.use(cors()); }
    app.use(express.static(process.env.PUBLIC_FOLDER || './public'));

    const getTile = (z: number, x: number, y: number, res: Response, raw = true) => {
      db.get(query(z, x, y), (err, row) => {
        if (err || !row) { return res.sendStatus(404); }
        if (raw) { return res.send(row.tile_data); }
        zlib.unzip(row.tile_data, (error, result) => {
          if (error || !result) {
            res.sendStatus(500);
          } else {
            res.send(result);
          }
        });
      });
    };

    app.get('/', (req, res) => {
      db.all('SELECT name, value FROM metadata', (err, rows) => {
        if (err) { return res.sendStatus(404); }
        res.json(JSON.stringify(rows));
      });
    });

    app.get('/tms/:z/:x/:y.:ext', (req, res) => {
      const z = +req.params['z'];
      const x = +req.params['x'];
      const y = +req.params['y']; // mbtiles are stored in TMS format
      getTile(z, x, y, res, req.params['ext'] === 'tile');
    });

    app.get('/:z/:x/:y.:ext', (req, res) => {
      const z = +req.params['z'];
      const x = +req.params['x'];
      const y = tms2slippy(z, +req.params['y']);  // mbtiles are stored in TMS format
      getTile(z, x, y, res, req.params['ext'] === 'tile');
    });

    app.listen(httpPort, () => console.info(`mbtiles-terrain-service is listening on port ${httpPort}`));
  }
}
