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
exports.MB_ConnectToDevice = void 0;
const net_1 = require("net");
const Modbus = require("jsmodbus");
const errors_1 = require("../../../types/server/errors");
const fixed_1 = require("set-interval-async/fixed");
class MB_ConnectToDevice {
    constructor(options, readParams, writeParams) {
        this.options = options;
        this.readParams = readParams;
        this.writeParams = writeParams;
        this._isConnected = false;
        this._lastErrorMsg = '';
        this.loop = () => {
            this._socket.on('error', () => {
                this._isConnected = false;
            });
            this._socket.on('close', () => {
                this._isConnected = false;
            });
            this._socket.on('connect', () => {
                this._isConnected = true;
            });
            (0, fixed_1.setIntervalAsync)(() => __awaiter(this, void 0, void 0, function* () {
                if (!this._isConnected) {
                    this._lastErrorMsg = 'Device offline';
                    this._socket.connect(this.options);
                }
                else {
                    try {
                        this._readBuffer.forEach((buffer, index) => __awaiter(this, void 0, void 0, function* () {
                            const data = yield this.mb_ReadRegisters(buffer.params);
                            this._readBuffer[index] = Object.assign(Object.assign({}, buffer), { data });
                        }));
                        const writeData = this._writeBuffer.filter((data) => data.execute);
                        if (writeData.length > 0) {
                            writeData.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                                yield this.mb_WriteRegisters(data.params);
                            }));
                            this._writeBuffer.forEach((data) => (data.execute = false));
                        }
                    }
                    catch (error) {
                        if (error instanceof errors_1.CustomError)
                            this._lastErrorMsg = error.message;
                        this._lastErrorMsg = 'Unknown error';
                    }
                }
            }), 1000);
        };
        this.mb_ReadRegisters = (params) => __awaiter(this, void 0, void 0, function* () {
            const promise = new Promise((resolve, reject) => {
                this._client
                    .readHoldingRegisters(params.start, params.count)
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
            const promise = new Promise((resolve, reject) => {
                this._client
                    .writeMultipleRegisters(params.start, params.data)
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
        this._readBuffer = this.readParams.map((params) => {
            return { params, data: [] };
        });
        this._writeBuffer = this.writeParams.map((params) => {
            return { params, execute: false };
        });
        this.loop();
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
    get lastErrorMsg() {
        return this._lastErrorMsg;
    }
}
exports.MB_ConnectToDevice = MB_ConnectToDevice;
