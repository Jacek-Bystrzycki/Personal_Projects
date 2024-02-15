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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MB_ConnectToDevice = void 0;
const net_1 = require("net");
const Modbus = require("jsmodbus");
const errors_1 = require("../../../types/server/errors");
const fixed_1 = require("set-interval-async/fixed");
class MB_ConnectToDevice {
    constructor(options, tagsDefs) {
        this.options = options;
        this.tagsDefs = tagsDefs;
        this._isConnected = false;
        this._connectCmd = false;
        this.loop = () => {
            this._socket.on('error', () => {
                this._isConnected = false;
                this._connectCmd = false;
            });
            this._socket.on('close', () => {
                this._isConnected = false;
                this._connectCmd = false;
            });
            this._socket.on('connect', () => {
                this._isConnected = true;
                this._connectCmd = false;
            });
            (0, fixed_1.setIntervalAsync)(() => __awaiter(this, void 0, void 0, function* () {
                if (!this._isConnected && !this._connectCmd) {
                    this._socket.connect(this.options);
                    this._connectCmd = true;
                }
                else {
                    this._readBuffer.forEach((tag) => __awaiter(this, void 0, void 0, function* () {
                        try {
                        }
                        catch (error) { }
                    }));
                    //============================================================
                    // try {
                    //   this._readBuffer.forEach(async (buffer, index) => {
                    //     const data = await this.mb_ReadRegisters(buffer);
                    //     this._readBuffer[index] = { ...buffer, data };
                    //   });
                    //   const writeData: MB_WriteTag[] = this._writeBuffer.filter((data) => data.execute);
                    //   if (writeData.length > 0) {
                    //     writeData.forEach(async (data) => {
                    //       await this.mb_WriteRegisters(data);
                    //     });
                    //     this._writeBuffer.forEach((data) => (data.execute = false));
                    //   }
                    // } catch (error) {
                    //   if (error instanceof CustomError) this._lastErrorMsg = error.message;
                    //   else this._lastErrorMsg = 'Unknown error';
                    // }
                }
            }), 1000);
        };
        this.mb_ReadRegisters = (params) => __awaiter(this, void 0, void 0, function* () {
            const { start, count } = params.params;
            const promise = new Promise((resolve, reject) => {
                this._client
                    .readHoldingRegisters(start, count)
                    .then(({ response }) => {
                    resolve(response.body.valuesAsArray);
                })
                    .catch((err) => {
                    const error = this.mb_handleErrors(err);
                    reject(new errors_1.InternalError(`${error}`));
                });
            });
            const timeout = new Promise((_, reject) => {
                setTimeout(() => reject(new errors_1.InternalError('Read registers timeout')), 1000);
            });
            return Promise.race([promise, timeout]);
        });
        this.mb_WriteRegisters = (params) => __awaiter(this, void 0, void 0, function* () {
            const { start, data } = params.params;
            const promise = new Promise((resolve, reject) => {
                this._client
                    .writeMultipleRegisters(start, data)
                    .then(() => {
                    resolve();
                })
                    .catch((err) => {
                    const error = this.mb_handleErrors(err);
                    reject(new errors_1.InternalError(`${error}`));
                });
            });
            const timeout = new Promise((_, reject) => {
                setTimeout(() => reject(new errors_1.InternalError('Write registers timeout')), 1000);
            });
            return Promise.race([promise, timeout]);
        });
        this.mb_handleErrors = (err) => {
            if (Modbus.errors.isUserRequestError(err)) {
                switch (err.err) {
                    case 'OutOfSync':
                    case 'Protocol':
                    case 'Timeout':
                    case 'ManuallyCleared':
                    case 'ModbusException':
                    case 'Offline':
                    case 'crcMismatch':
                        return 'Error Message: ' + err.message, 'Error' + 'Modbus Error Type: ' + err.err;
                }
            }
            else if (Modbus.errors.isInternalException(err)) {
                return `Error Message: '  ${err.message}, 'Error' + 'Error Name: ' ${(err.name, err.stack)}`;
            }
            else {
                return `Unknown Error, ${err}`;
            }
        };
        this._socket = new net_1.Socket();
        this._client = new Modbus.client.TCP(this._socket);
        this._readBuffer = this.tagsDefs.map((tagDef) => {
            const _a = tagDef.params, { data } = _a, params = __rest(_a, ["data"]);
            return { params, id: tagDef.id, format: tagDef.format, data: [], isError: true, status: 'Init Error' };
        });
        this._writeBuffer = this.tagsDefs.map((tagDef) => {
            return { params: tagDef.params, id: tagDef.id, format: tagDef.format, execute: false, isError: true, status: 'Write not triggered yet' };
        });
        this._readBufferConsistent = this._readBuffer;
        this._writeBufferConsistent = this._writeBuffer;
        // this.loop();
    }
    get readBuffer() {
        return this._readBuffer;
    }
    get writeBuffer() {
        return this._writeBuffer;
    }
    set writeBuffer(data) {
        this._writeBuffer = data;
    }
    get isConnected() {
        return this._isConnected;
    }
}
exports.MB_ConnectToDevice = MB_ConnectToDevice;
