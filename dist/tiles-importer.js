"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var sqlite3 = require("sqlite3");
var ProgressBar = require("progress");
var sqlite3_1 = require("sqlite3");
var async_1 = require("async");
var utils_1 = require("./utils");
var poolboy_1 = require("./poolboy");
var TilesImporter = (function () {
    function TilesImporter(options) {
        this.options = options;
        this.log = utils_1.logger(options.verbose);
        this.process();
    }
    TilesImporter.prototype.process = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var regex, mbtiles, isTms, ready, myPool, unprocessedFiles, processedFiles, processFile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        regex = path.sep === '\\' ? /\\(\d+)\\(\d+)\\(\d+)\./ : /\/(\d+)\/(\d+)\/(\d+)\./;
                        return [4, this.initDatabase(this.options.src)];
                    case 1:
                        mbtiles = _a.sent();
                        isTms = this.options.format === 'tms';
                        ready = function () {
                            _this.log.info('Finished processing all files...');
                            _this.log.info("Unprocessed " + unprocessedFiles + ", allready processed " + processedFiles + " files.");
                        };
                        myPool = poolboy_1.createPool(mbtiles, sqlite3.OPEN_READWRITE, true);
                        unprocessedFiles = 0;
                        processedFiles = 0;
                        processFile = function (f) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2, new Promise(function (resolve, reject) {
                                        unprocessedFiles++;
                                        var m = regex.exec(f);
                                        var z = +m[1];
                                        var x = +m[2];
                                        var y = isTms ? +m[3] : utils_1.tms2slippy(z, +m[3]);
                                        fs.readFile(f, function (err, data) {
                                            if (!err) {
                                                myPool.acquire().then(function (db) {
                                                    db.run('INSERT INTO tiles(zoom_level, tile_column, tile_row, tile_data) VALUES (?, ?, ?, ?)', z, x, y, data, function () {
                                                        processedFiles++;
                                                        myPool.release(db);
                                                        if (processedFiles >= unprocessedFiles) {
                                                            ready();
                                                        }
                                                        resolve();
                                                    });
                                                });
                                            }
                                            else {
                                                processedFiles++;
                                                resolve();
                                            }
                                        });
                                    })];
                            });
                        }); };
                        this.log.info("Reading all files in " + this.options.input + "...");
                        console.time('Processing');
                        utils_1.walkTalk(this.options.input, 100, regex, processFile, function (err, count) {
                            _this.log.info("Found " + count + " files, allready processed " + processedFiles + " files.");
                            console.timeEnd('Processing');
                        });
                        return [2];
                }
            });
        });
    };
    TilesImporter.prototype.importFiles2 = function (db, files, regex) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var isTms, validFiles, filesToBeProcessed, bar, stmt;
            return __generator(this, function (_a) {
                this.log.info("Extracting zoom, x and y...");
                isTms = this.options.format === 'tms';
                validFiles = files.filter(function (f) { return regex.test(f); }).map(function (f) {
                    var m = regex.exec(f);
                    var z = +m[1];
                    var x = +m[2];
                    var y = isTms ? +m[3] : utils_1.tms2slippy(z, +m[3]);
                    return { z: z, x: x, y: y, f: f };
                });
                filesToBeProcessed = validFiles.length;
                bar = new ProgressBar('  :current of :total :percent :etas', {
                    complete: '=',
                    incomplete: ' ',
                    width: 40,
                    total: filesToBeProcessed
                });
                this.log.info("Found " + filesToBeProcessed + " files: processing started...");
                stmt = db.prepare('INSERT INTO tiles(zoom_level, tile_column, tile_row, tile_data) VALUES (?, ?, ?, ?)');
                console.time('Processing');
                async_1.eachLimit(validFiles, 100, function (vf, done) {
                    var x = vf.x, y = vf.y, z = vf.z, f = vf.f;
                    fs.readFile(f, function (err, data) {
                        filesToBeProcessed--;
                        bar.tick(1);
                        if (err) {
                            return _this.log.error(err);
                        }
                        stmt.run(z, x, y, data);
                        if (filesToBeProcessed <= 0) {
                            stmt.finalize();
                            console.timeEnd('Processing');
                        }
                        done();
                    });
                }, function (err) {
                    if (err) {
                        _this.log.error(err);
                        process.exit(1);
                    }
                    _this.log.info('DONE');
                    db.close();
                    process.exit(0);
                });
                return [2];
            });
        });
    };
    TilesImporter.prototype.initDatabase = function (mbtiles) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                mbtiles = path.resolve(mbtiles);
                if (fs.existsSync(mbtiles)) {
                    throw new Error("Database " + mbtiles + " already exists - cannot append!");
                }
                return [2, new Promise(function (resolve, reject) {
                        var db = new sqlite3_1.Database(mbtiles, function (err) {
                            if (err) {
                                throw new Error(err.message);
                            }
                            _this.log.info("Connected to " + mbtiles + " database.");
                            db.run("CREATE TABLE metadata (name text, value text)", function (result, err2) {
                                if (err2) {
                                    throw new Error(err2.message);
                                }
                                var stmt = db.prepare('INSERT INTO metadata(name, value) VALUES (?, ?)');
                                stmt.run('name', path.basename(mbtiles));
                                stmt.run('type', 'baselayer');
                                stmt.run('version', 1);
                                stmt.run('description', 'A set of tiles: it was created to serve Cesium v1 height tiles');
                                stmt.run('format', 'unknown');
                                stmt.run('tms', _this.options.format === 'tms');
                                stmt.finalize();
                                db.run('CREATE TABLE tiles (zoom_level integer, tile_column integer, tile_row integer, tile_data blob)');
                                db.close();
                                resolve(mbtiles);
                            });
                        });
                    })];
            });
        });
    };
    return TilesImporter;
}());
exports.TilesImporter = TilesImporter;
//# sourceMappingURL=tiles-importer.js.map