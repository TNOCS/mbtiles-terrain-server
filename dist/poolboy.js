"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var genericPool = require("generic-pool");
var sqlite3_1 = require("sqlite3");
exports.createPool = function (filename, mode, synchronous) {
    if (synchronous === void 0) { synchronous = false; }
    var factory = {
        create: function () { return new Promise(function (resolve, reject) {
            var client = new sqlite3_1.Database(filename, mode, function (err) {
                if (err) {
                    throw new Error(err.message);
                }
                client.run('PRAGMA synchronous=OFF', function () { return resolve(client); });
            });
        }); },
        destroy: function (client) { return new Promise(function (resolve) {
            client.close(function (err) {
                if (err) {
                    throw new Error(err.message);
                }
                resolve();
            });
        }); }
    };
    var opts = {
        max: 10,
        min: 2
    };
    return genericPool.createPool(factory, opts);
};
//# sourceMappingURL=poolboy.js.map