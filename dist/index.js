module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(198);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 82:
/***/ (function(__unusedmodule, exports) {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 85:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgeAddonsAPI = exports.requiredFields = exports.errorMap = void 0;
const fs_1 = __webpack_require__(747);
let got = {
    post: (url, options) => {
        return fetch(url, Object.assign({ method: 'POST' }, options)).then(got.handleResponse);
    },
    get: (url, options) => {
        return fetch(url, Object.assign({ method: 'GET' }, options)).then(got.handleResponse);
    },
    handleResponse: (response) => {
        var _a;
        return Object.assign(Object.assign({}, response), { statusCode: response.status, headers: Object.assign(Object.assign({}, response.headers), { location: (_a = response.headers) === null || _a === void 0 ? void 0 : _a.get('location') }), json: function () {
                return response.json();
            } });
    },
};
exports.errorMap = {
    productId: "Product ID is required. To get one, go to: https://partner.microsoft.com/en-us/dashboard/microsoftedge/{product-id}/package/dashboard",
    clientId: "Client ID is required. To get one: https://partner.microsoft.com/en-us/dashboard/microsoftedge/publishapi",
    clientSecret: "Client Secret is required. To get one: https://partner.microsoft.com/en-us/dashboard/microsoftedge/publishapi",
    accessTokenUrl: "Access token URL is required. To get one: https://partner.microsoft.com/en-us/dashboard/microsoftedge/publishapi"
};
exports.requiredFields = Object.keys(exports.errorMap);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const baseApiUrl = "https://api.addons.microsoftedge.microsoft.com";
class EdgeAddonsAPI {
    constructor(options) {
        this.options = {};
        // https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/api/addons-api-reference#status-codes
        this.handleTempStatus = (statusCode, action) => {
            if (statusCode !== 202) {
                if (statusCode >= 500) {
                    throw new Error("Edge server error, please try again later");
                }
                else {
                    throw new Error(`${action} failed, double check your api credentials`);
                }
            }
        };
        this.getAccessToken = () => __awaiter(this, void 0, void 0, function* () {
            const data = (yield got
                .post(`${this.options.accessTokenUrl}`, {
                body: `client_id=${this.options.clientId}&scope=${baseApiUrl}/.default&client_secret=${this.options.clientSecret}&grant_type=client_credentials`,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }))
                .json();
            return data.access_token;
        });
        for (const field of exports.requiredFields) {
            if (!options[field]) {
                throw new Error(exports.errorMap[field]);
            }
            this.options[field] = options[field];
        }
    }
    get productEndpoint() {
        return `${baseApiUrl}/v1/products/${this.options.productId}`;
    }
    get publishEndpoint() {
        return `${this.productEndpoint}/submissions`;
    }
    get uploadEndpoint() {
        return `${this.publishEndpoint}/draft/package`;
    }
    /**
     * @returns the publish operation id
     */
    submit({ filePath = "", notes = "" }) {
        return __awaiter(this, void 0, void 0, function* () {
            const accessToken = yield this.getAccessToken();
            const uploadResp = yield this.upload((0, fs_1.createReadStream)(filePath), accessToken);
            yield this.waitForUpload(uploadResp, accessToken);
            return this.publish(notes, accessToken);
        });
    }
    publish(notes = "", _accessToken = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const accessToken = _accessToken || (yield this.getAccessToken());
            const options = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            };
            if (notes.length > 0) {
                options.body = `{ "notes"="${notes}" }`;
            }
            const publishResp = yield got.post(this.publishEndpoint, options);
            this.handleTempStatus(publishResp.statusCode, "Submit");
            return publishResp.headers.location;
        });
    }
    upload(readStream = null, _accessToken = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const accessToken = _accessToken || (yield this.getAccessToken());
            const uploadResp = yield got.post(this.uploadEndpoint, {
                body: readStream,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/zip"
                }
            });
            this.handleTempStatus(uploadResp.statusCode, "Upload");
            return uploadResp.headers.location;
        });
    }
    getPublishStatus(operationId, _accessToken = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const accessToken = _accessToken || (yield this.getAccessToken());
            const statusEndpoint = `${this.publishEndpoint}/operations/${operationId}`;
            return (yield got.get(statusEndpoint, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })).json();
        });
    }
    waitForUpload(operationId, _accessToken = null, retryCount = 5, pollTime = 3000) {
        return __awaiter(this, void 0, void 0, function* () {
            const accessToken = _accessToken || (yield this.getAccessToken());
            const statusEndpoint = `${this.uploadEndpoint}/operations/${operationId}`;
            let successMessage;
            let uploadStatus;
            let attempts = 0;
            // @ts-ignore
            while (uploadStatus !== "Succeeded" && attempts < retryCount) {
                const statusResp = (yield got
                    .get(statusEndpoint, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }))
                    .json();
                if (statusResp.status === "Failed") {
                    throw new Error(statusResp.message ||
                        statusResp.errorCode + ":" + (statusResp.errors || []).join(","));
                }
                else if (statusResp.status === "InProgress") {
                    yield wait(pollTime);
                }
                else if (statusResp.status === "Succeeded") {
                    successMessage = statusResp.message;
                }
                uploadStatus = statusResp.status;
                attempts++;
            }
            // @ts-ignore
            return successMessage;
        });
    }
}
exports.EdgeAddonsAPI = EdgeAddonsAPI;


/***/ }),

/***/ 87:
/***/ (function(module) {

module.exports = require("os");

/***/ }),

/***/ 102:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

// For internal use, subject to change.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__webpack_require__(747));
const os = __importStar(__webpack_require__(87));
const utils_1 = __webpack_require__(82);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 198:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugPrintf = void 0;
const core_1 = __webpack_require__(238);
const core = __importStar(__webpack_require__(470));
let getInput = () => {
    var _a;
    return ({
        debug: core.getInput('debug') === 'true',
        product_id: core.getInput('product_id'),
        client_id: core.getInput('client_id'),
        client_secret: core.getInput('client_secret'),
        access_token_url: core.getInput('access_token_url'),
        addone_file: core.getInput('addone_file'),
        notes: (_a = core.getInput('notes')) !== null && _a !== void 0 ? _a : 'unset notes',
    });
};
let handleOutput = (output = {}) => {
    Object.keys(output).forEach((key) => core.setOutput(key, output[key]));
    (0, exports.debugPrintf)('输出变量: ', output);
};
try {
    handleOutput((0, core_1.run)(getInput()));
}
catch (error) {
    core.setFailed(error === null || error === void 0 ? void 0 : error.message);
}
let debugPrintf = (...args) => {
    if (getInput().debug) {
        console.log(...args);
    }
};
exports.debugPrintf = debugPrintf;


/***/ }),

/***/ 238:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const main_1 = __webpack_require__(198);
const api_1 = __webpack_require__(85);
function run(input) {
    const client = new api_1.EdgeAddonsAPI({
        productId: input.product_id,
        clientId: input.client_id,
        clientSecret: input.client_secret,
        accessTokenUrl: input.access_token_url
    });
    client.submit({
        filePath: input.addone_file,
        notes: input.notes
    }).then(main_1.debugPrintf).catch(main_1.debugPrintf);
    return {};
}
exports.run = run;


/***/ }),

/***/ 431:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __importStar(__webpack_require__(87));
const utils_1 = __webpack_require__(82);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 470:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = __webpack_require__(431);
const file_command_1 = __webpack_require__(102);
const utils_1 = __webpack_require__(82);
const os = __importStar(__webpack_require__(87));
const path = __importStar(__webpack_require__(622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 622:
/***/ (function(module) {

module.exports = require("path");

/***/ }),

/***/ 747:
/***/ (function(module) {

module.exports = require("fs");

/***/ })

/******/ });