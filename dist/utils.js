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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var async_1 = require("async");
exports.logger = function (verbose) {
    var info = function (msg) { return verbose ? console.log(msg) : null; };
    var error = function (msg) { return console.error(msg); };
    return { info: info, error: error };
};
exports.walk = function (dir, done) {
    dir = path.resolve(dir);
    if (!fs.existsSync(dir)) {
        return done(new Error("Folder " + dir + " does not exist!"));
    }
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) {
            return done(err);
        }
        var pending = list.length;
        if (!pending) {
            return done(null, results);
        }
        list.forEach(function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    exports.walk(file, function (err, res) {
                        results = results.concat(res);
                        if (!--pending) {
                            done(null, results);
                        }
                    });
                }
                else {
                    results.push(file);
                    if (!--pending) {
                        done(null, results);
                    }
                }
            });
        });
    });
};
exports.walkTest = function (dir, regex, done) {
    dir = path.resolve(dir);
    if (!fs.existsSync(dir)) {
        return done(new Error("Folder " + dir + " does not exist!"));
    }
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) {
            return done(err);
        }
        var pending = list.length;
        if (!pending) {
            return done(null, results);
        }
        async_1.eachLimit(list, 10, function (file, limitReached) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                limitReached();
                if (stat && stat.isDirectory()) {
                    exports.walkTest(file, regex, function (err, res) {
                        results = results.concat(res);
                        if (!--pending) {
                            done(null, results);
                        }
                    });
                }
                else {
                    if (regex.test(file)) {
                        results.push(file);
                    }
                    if (!--pending) {
                        done(null, results);
                    }
                }
            });
        });
    });
};
exports.walkTalk = function (dir, limit, regex, process, done) { return __awaiter(_this, void 0, void 0, function () {
    var _this = this;
    var count;
    return __generator(this, function (_a) {
        dir = path.resolve(dir);
        count = 0;
        if (!fs.existsSync(dir)) {
            return [2, done(new Error("Folder " + dir + " does not exist!"), 0)];
        }
        fs.readdir(dir, function (err, files) {
            if (err) {
                return done(err, count);
            }
            var pending = files.length;
            if (!pending) {
                return done(null, count);
            }
            async_1.eachLimit(files, limit, function (file, limitReached) { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    file = path.resolve(dir, file);
                    fs.stat(file, function (err, stat) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(stat && stat.isDirectory())) return [3, 1];
                                    exports.walkTalk(file, limit, regex, process, function (err, counted) {
                                        count += counted;
                                        limitReached();
                                        if (!--pending) {
                                            done(null, count);
                                        }
                                    });
                                    return [3, 4];
                                case 1:
                                    if (!regex.test(file)) return [3, 3];
                                    count++;
                                    return [4, process(file)];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3:
                                    limitReached();
                                    if (!--pending) {
                                        done(null, count);
                                    }
                                    _a.label = 4;
                                case 4: return [2];
                            }
                        });
                    }); });
                    return [2];
                });
            }); });
        });
        return [2];
    });
}); };
exports.tms2slippy = function (z, y) { return Math.pow(2, z) - y - 1; };
//# sourceMappingURL=utils.js.map