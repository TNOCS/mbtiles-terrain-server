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
        { name: 'help', alias: 'h', type: Boolean, typeLabel: '[underline]{Boolean}', description: 'Show usage instructions.' },
        { name: 'cors', alias: 'c', type: Boolean, defaultValue: true, typeLabel: '[underline]{Boolean}', description: 'Use CORS (default true).' },
        { name: 'verbose', alias: 'v', type: Boolean, typeLabel: '[underline]{Boolean}', description: 'Output is verbose.' }
    ];
    CommandLineInterface.sections = [{
            header: 'MBtiles-terrain-server',
            content: 'Import terrain tiles from a folder, and serve them either as TMS or slippy maps.\nFor example, use `host:port/tms/z/x/y.tile` or `host:port/z/x/y.tile` to get the raw (zipped) terrain data in TMS or slippy maps format, respectively. Alternatively, using another extension e.g. terrain, will get the unzipped data in Cesium v1.0 height map format.`'
        }, {
            header: 'Options',
            optionList: CommandLineInterface.optionDefinitions
        }, {
            header: 'Examples',
            content: [{
                    desc: '01. Create a new SQLite data by importing a folder with terrain tiles in slippy map format.',
                    example: '$ mbtiles-terrain-server -i ./tiles ./data/terrain.tiles'
                }, {
                    desc: '02. Create a new SQLite data by importing a folder with terrain tiles in TMS format.',
                    example: '$ mbtiles-terrain-server -f tms -i ./tiles ./data/terrain.tiles'
                }, {
                    desc: '03. Serve the terrain tiles using CORS on port 8321.',
                    example: '$ mbtiles-terrain-server -p 8321 ./data/terrain.tiles'
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