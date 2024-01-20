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
class MB_ConnectToDevice {
    constructor(options) {
        this.options = options;
        this._readBuffer = [];
        this._isConnected = false;
        this.reconnect = () => {
            this._socket.on('error', () => {
                this._isConnected = false;
            });
            this._socket.on('close', () => {
                this._isConnected = false;
            });
            this._socket.on('connect', () => {
                this._isConnected = true;
            });
            setInterval(() => {
                if (!this._isConnected) {
                    this._socket.connect(this.options);
                }
            }, 1000);
        };
        this.mb_ReadRegisters = (regs) => __awaiter(this, void 0, void 0, function* () {
            const promise = new Promise((resolve, reject) => {
                this._client
                    .readHoldingRegisters(...regs)
                    .then(({ response }) => {
                    this._readBuffer = response.body.valuesAsArray;
                    resolve(this._readBuffer);
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
        this.mb_WriteRegisters = (start, data) => __awaiter(this, void 0, void 0, function* () {
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
        this.reconnect();
    }
    get readBuffer() {
        return this._readBuffer;
    }
}
exports.MB_ConnectToDevice = MB_ConnectToDevice;
