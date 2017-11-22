"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sqlite3_1 = require("sqlite3");
var utils_1 = require("./utils");
var express = require("express");
var cors = require("cors");
var zlib = require("zlib");
var TilesServer = (function () {
    function TilesServer(options) {
        var _this = this;
        this.options = options;
        var db = new sqlite3_1.Database(options.src, function (err) {
            _this.startServer(db, options);
        });
    }
    TilesServer.prototype.startServer = function (db, options) {
        var httpPort = options.port || process.env.PORT || 8123;
        var app = express();
        var query = function (z, x, y) { return "SELECT tile_data FROM tiles WHERE zoom_level = " + z + " AND tile_column = " + x + " AND tile_row = " + y; };
        if (options.cors) {
            app.use(cors());
        }
        app.use(express.static(process.env.PUBLIC_FOLDER || './public'));
        var getTile = function (z, x, y, res, raw) {
            if (raw === void 0) { raw = true; }
            db.get(query(z, x, y), function (err, row) {
                if (err || !row) {
                    return res.sendStatus(404);
                }
                if (raw) {
                    return res.send(row.tile_data);
                }
                zlib.unzip(row.tile_data, function (error, result) {
                    if (error || !result) {
                        res.sendStatus(500);
                    }
                    else {
                        res.send(result);
                    }
                });
            });
        };
        app.get('/', function (req, res) {
            db.all('SELECT name, value FROM metadata', function (err, rows) {
                if (err) {
                    return res.sendStatus(404);
                }
                res.json(JSON.stringify(rows));
            });
        });
        app.get('/tms/:z/:x/:y.:ext', function (req, res) {
            var z = +req.params['z'];
            var x = +req.params['x'];
            var y = +req.params['y'];
            getTile(z, x, y, res, req.params['ext'] === 'tile');
        });
        app.get('/:z/:x/:y.:ext', function (req, res) {
            var z = +req.params['z'];
            var x = +req.params['x'];
            var y = utils_1.tms2slippy(z, +req.params['y']);
            getTile(z, x, y, res, req.params['ext'] === 'tile');
        });
        app.listen(httpPort, function () { return console.info("mbtiles-terrain-service is listening on port " + httpPort); });
    };
    return TilesServer;
}());
exports.TilesServer = TilesServer;
//# sourceMappingURL=tiles-server.js.map