import { TilesServer } from './tiles-server';
import { TilesImporter } from './tiles-importer';
import * as commandLineArgs from 'command-line-args';
import { OptionDefinition } from 'command-line-args';

export interface ICommandOptions {
  /**
   * Expected input format, either 'tms' or 'slippy'.
   */
  format: 'tms' | 'slippy';
  /**
   * Be verbose
   */
  verbose: boolean;
  /**
   * Port you wish to use.
   */
  port: number;
  /**
   * Whether you want to enable CORS
   */
  cors: boolean;
  /**
   * Input folder when importing
   */
  input: string;
  /**
   * MBtiles file, either for importing data, or for serving: you do not need to supply the -s flag.
   */
  src: string;
  /**
   * Show usage instructions
   */
  help: boolean;
}



/**
 * Adds missing properties from typings.
 */
export interface FixedOptionDefinition extends OptionDefinition {
  description: string;
  typeLabel: string;
}

export class CommandLineInterface {
  static optionDefinitions: FixedOptionDefinition[] = [
    { name: 'format', alias: 'f', type: String, typeLabel: '[underline]{String}', defaultValue: 'slippy', description: 'Expected input format, either \'tms\' or \'slippy\' (default).' },
    { name: 'port', alias: 'p', type: Number, defaultValue: 8080, typeLabel: '[underline]{Number}', description: 'Port you wish to use. Default is port 8080.' },
    { name: 'input', alias: 'i', type: String, typeLabel: '[underline]{String}', description: 'Input folder you wish to import.' },
    { name: 'src', alias: 's', type: String, defaultOption: true, typeLabel: '[underline]{File name}', description: 'MBtiles file to write or read.' },
    { name: 'help', alias: 'h', type: Boolean, typeLabel: '[underline]{Boolean}', description: 'Show this usage instructions.' },
    { name: 'cors', alias: 'c', type: Boolean, defaultValue: true, typeLabel: '[underline]{Boolean}', description: 'Use CORS (default true).' },
    { name: 'verbose', alias: 'v', type: Boolean, typeLabel: '[underline]{Boolean}', description: 'Output is verbose.' }
  ];

  static sections = [{
    header: 'MBtiles-terrain-server',
    content: `Import Cesium v1 terrain tiles from a folder into an mbtiles (sqlite3)
    database, or serve the tiles in an mbtiles database either as TMS or
    slippy maps.

    It was developed to import a folder with 14 million very small terrain
    tiles (in Cesium v1 height format) into an mbtiles (sqlite3) database,
    and to serve those terrain tiles from there. In that way, we can also
    serve the tiles unzipped, which is useful for our HoloLens application,
    WorldExplorer. However, you could also use it to import other terrain tiles.

    For example, after running example 3 below, you can get the raw (zipped)
    tiles at "host:port/tms/z/x/y.tile" or "host:port/z/x/y.tile" in TMS or
    slippy maps format, respectively. Alternatively, at
    "host:port/tms/z/x/y.terrain" or "host:port/z/x/y.terrain", you can retreive
    the unzipped data.

    When importing many files, you may have to run node using the
    --max-old-space-size option e.g.
    "node --max-old-space-size=4096 dist/cli.js -v -f tms -i c:/tmp/tiles tiles.sqlite3"`
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
}

const options: ICommandOptions = commandLineArgs(CommandLineInterface.optionDefinitions);
if (!options.src || options.help) {
  console.log('\nSupplied options: ');
  console.log(options);
  console.log('\nNo source specified.\n');
  const getUsage = require('command-line-usage');
  const usage = getUsage(CommandLineInterface.sections);
  console.log(usage);
  process.exit(1);
}

if (options.input) {
  new TilesImporter(options);
} else {
  new TilesServer(options);
}

