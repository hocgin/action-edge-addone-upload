import {run} from "./core";
import * as core from "@actions/core";

export interface Inputs {
    debug?: boolean;
    product_id: string;
    client_id: string;
    client_secret: string;
    access_token_url: string;
    addone_file: string;
    notes?: string;
}

export interface Outputs {
    // ..
    [key: string]: any
}

let getInput = (): Inputs => ({
    debug: core.getInput('debug') === 'true',
    product_id: core.getInput('product_id'),
    client_id: core.getInput('client_id'),
    client_secret: core.getInput('client_secret'),
    access_token_url: core.getInput('access_token_url'),
    addone_file: core.getInput('addone_file'),
    notes: core.getInput('notes') ?? 'unset notes',
})

let handleOutput = (output: Outputs = {}) => {
    Object.keys(output).forEach((key) => core.setOutput(key, output[key]));
    debugPrintf('输出变量: ', output);
};

try {
    handleOutput(run(getInput()))
} catch (error: any) {
    core.setFailed(error?.message);
}

export function debugPrintf(...args: any) {
    if (getInput().debug) {
        console.log(...args);
    }
}
