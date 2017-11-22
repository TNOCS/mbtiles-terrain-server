"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tiles_server_1 = require("./tiles-server");
var tiles_importer_1 = require("./tiles-importer");
var commandLineArgs = require("command-line-args");
var CommandLineInterface = (function () {
    function CommandLineInterface() {
    }
    CommandLineInterface.optionDefinitions = [
        { name: 'format', alias: 'f', type: String, typeLabel: '[underline]{String}', defaultValue: 'slippy', description: 'Expected input format, either \'tms\' or \'slippy\' (default).' },
        { name: 'port', alias: 'p', type: Number, defaultValue: 8080, typeLabel: '[underline]{Number}', description: 'Port you wish to use. Default is port 8080.' },
        { name: 'input', alias: 'i', type: String, typeLabel: '[underline]{String}', description: 'Input folder you wish to import.' },
        { name: 'src', alias: 's', type: String, defaultOption: true, typeLabel: '[underline]{File name}', description: 'MBtiles file to write or read.' },
        { name: 'help', alias: 'h', type: Boolean, typeLabel: '[underline]{Boolean}', description: 'Show this usage instructions.' },
        { name: 'cors', alias: 'c', type: Boolean, defaultValue: true, typeLabel: '[underline]{Boolean}', description: 'Use CORS (default true).' },
        { name: 'verbose', alias: 'v', type: Boolean, typeLabel: '[underline]{Boolean}', description: 'Output is verbose.' }
    ];
    CommandLineInterface.sections = [{
            header: 'MBtiles-terrain-server',
            content: "Import Cesium v1 terrain tiles from a folder into an mbtiles (sqlite3)\n    database, or serve the tiles in an mbtiles database either as TMS or\n    slippy maps.\n\n    It was developed to import a folder with 14 million very small terrain\n    tiles (in Cesium v1 height format) into an mbtiles (sqlite3) database,\n    and to serve those terrain tiles from there. In that way, we can also\n    serve the tiles unzipped, which is useful for our HoloLens application,\n    WorldExplorer. However, you could also use it to import other terrain tiles.\n\n    For example, after running example 3 below, you can get the raw (zipped)\n    tiles at \"host:port/tms/z/x/y.tile\" or \"host:port/z/x/y.tile\" in TMS or\n    slippy maps format, respectively. Alternatively, at\n    \"host:port/tms/z/x/y.terrain\" or \"host:port/z/x/y.terrain\", you can retreive\n    the unzipped data.\n\n    When importing many files, you may have to run node using the\n    --max-old-space-size option e.g.\n    \"node --max-old-space-size=4096 dist/cli.js -v -f tms -i c:/tmp/tiles tiles.sqlite3\""
        }, {
            header: 'Options',
            optionList: CommandLineInterface.optionDefinitions
        }, {
            header: 'Examples',
            content: [{
                    desc: '01. Create a new SQLite data by importing a folder with terrain tiles in slippy map format.',
                    example: '$ mbtiles-terrain-server -i ./tiles ./data/terrain.sqlite3'
                }, {
                    desc: '02. Create a new SQLite data by importing a folder with terrain tiles in TMS format.',
                    example: '$ mbtiles-terrain-server -f tms -i ./tiles ./data/terrain.sqlite3'
                }, {
                    desc: '03. Serve the terrain tiles using CORS on port 8321.',
                    example: '$ mbtiles-terrain-server -p 8321 ./data/terrain.sqlite3'
                }]
        }
    ];
    return CommandLineInterface;
}());
exports.CommandLineInterface = CommandLineInterface;
var options = commandLineArgs(CommandLineInterface.optionDefinitions);
if (!options.src || options.help) {
    console.log('\nSupplied options: ');
    console.log(options);
    console.log('\nNo source specified.\n');
    var getUsage = require('command-line-usage');
    var usage = getUsage(CommandLineInterface.sections);
    console.log(usage);
    process.exit(1);
}
if (options.input) {
    new tiles_importer_1.TilesImporter(options);
}
else {
    new tiles_server_1.TilesServer(options);
}
//# sourceMappingURL=cli.js.map