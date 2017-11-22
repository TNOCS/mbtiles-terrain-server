import * as fs from 'fs';
import * as path from 'path';
import { eachLimit } from 'async';

export const logger = (verbose: boolean) => {
  const info = (msg: any) => verbose ? console.log(msg) : null;
  const error = (msg: any) => console.error(msg);
  return { info, error };
};

/**
 * Recursively walk through a folder, picking up all files.
 *
 * @see https://stackoverflow.com/a/5827895/319711
 * @param dir Folder name
 * @param done Callback function
 */
export const walk = (dir: string, done: (err: NodeJS.ErrnoException, files?: string[]) => void) => {
  dir = path.resolve(dir);
  if (!fs.existsSync(dir)) { return done(new Error(`Folder ${dir} does not exist!`)); }
  let results: string[] = [];
  fs.readdir(dir, (err, list) => {
    if (err) { return done(err); }
    let pending = list.length;
    if (!pending) { return done(null, results); }
    list.forEach(file => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) { done(null, results); }
          });
        } else {
          results.push(file);
          if (!--pending) { done(null, results); }
        }
      });
    });
  });
};

/**
 * Recursively walk through a folder, picking up all files that satisfy the regex.
 *
 * @see https://stackoverflow.com/a/5827895/319711
 * @param dir Folder name
 * @param regex A regular expression that tests the pattern
 * @param done Callback function
 */
export const walkTest = (dir: string, regex: RegExp, done: (err: NodeJS.ErrnoException, files?: string[]) => void) => {
  dir = path.resolve(dir);
  if (!fs.existsSync(dir)) { return done(new Error(`Folder ${dir} does not exist!`)); }
  let results: string[] = [];
  fs.readdir(dir, (err, list) => {
    if (err) { return done(err); }
    let pending = list.length;
    if (!pending) { return done(null, results); }
    eachLimit(list, 10, (file, limitReached) => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        limitReached();
        if (stat && stat.isDirectory()) {
          walkTest(file, regex, (err, res) => {
            results = results.concat(res);
            if (!--pending) { done(null, results); }
          });
        } else {
          if (regex.test(file)) { results.push(file); }
          if (!--pending) { done(null, results); }
        }
      });
    });
  });
};

/**
 * Recursively walk through a folder, processing all files that satisfy the regex pattern.
 *
 * @see https://stackoverflow.com/a/5827895/319711
 * @param dir Folder name
 * @param limit Limit the number of open connections
 * @param regex A regular expression that tests the pattern
 * @param process A function that is invoked for processing the file
 * @param done Callback function
 */
export const walkTalk = async (dir: string, limit: number, regex: RegExp, process: (file: string) => void, done: (err: NodeJS.ErrnoException, count: number) => void) => {
  dir = path.resolve(dir);
  let count = 0;
  if (!fs.existsSync(dir)) { return done(new Error(`Folder ${dir} does not exist!`), 0); }
  fs.readdir(dir, (err, files) => {
    if (err) { return done(err, count); }
    let pending = files.length;
    if (!pending) { return done(null, count); }
    eachLimit(files, limit, async (file, limitReached) => {
      file = path.resolve(dir, file);
      fs.stat(file, async (err, stat) => {
        if (stat && stat.isDirectory()) {
          walkTalk(file, limit, regex, process, (err, counted) => {
            count += counted;
            limitReached();
            if (!--pending) { done(null, count); }
          });
        } else {
          if (regex.test(file)) {
            count++;
            await process(file);
          }
          limitReached();
          if (!--pending) { done(null, count); }
        }
      });
    });
  });
};

/**
 * Convert the y parameter of a tile from TMS to slippy map format: 2^z - y - 1
 *
 * @param z Z parameter of a tile.
 * @param y Y parameter of a tile.
 */
export const tms2slippy = (z: number, y: number) => Math.pow(2, z) - y - 1;