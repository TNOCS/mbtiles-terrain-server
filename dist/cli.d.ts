/// <reference types="command-line-args" />
import { OptionDefinition } from 'command-line-args';
export interface ICommandOptions {
    format: 'tms' | 'slippy';
    verbose: boolean;
    port: number;
    cors: boolean;
    input: string;
    src: string;
    help: boolean;
}
export interface FixedOptionDefinition extends OptionDefinition {
    description: string;
    typeLabel: string;
}
export declare class CommandLineInterface {
    static optionDefinitions: FixedOptionDefinition[];
    static sections: ({
        header: string;
        content: string;
    } | {
        header: string;
        optionList: FixedOptionDefinition[];
    } | {
        header: string;
        content: {
            desc: string;
            example: string;
        }[];
    })[];
}
