import * as genericPool from 'generic-pool';
import * as sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';

export const createPool = (filename: string, mode: number, synchronous = false) => {
  /**
   * Step 1 - Create pool using a factory object
   */
  const factory = {
    create: () => new Promise<Database>((resolve, reject) => {
      const client = new Database(filename, mode, (err) => {
        if (err) { throw new Error(err.message); }
        // https://www.sqlite.org/pragma.html#pragma_synchronous
        // With synchronous OFF (0), commits can be orders of magnitude faster with synchronous OFF.
        client.run('PRAGMA synchronous=OFF', () => resolve(client));
      });
    }),
    destroy: (client: Database) => new Promise<undefined>((resolve) => {
      client.close(err => {
        if (err) { throw new Error(err.message); }
        resolve();
      });
    })
  };

  const opts = {
    max: 10, // maximum size of the pool
    min: 2 // minimum size of the pool
  };

  return genericPool.createPool(factory, opts);
};
