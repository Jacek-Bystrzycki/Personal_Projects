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
    constructor(options, uId, tagsDefs) {
        this.options = options;
        this.uId = uId;
        this.tagsDefs = tagsDefs;
        this._syncQueue = [];
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
                try {
                    if (this._isConnected) {
                        //============ READ ASYNC ======================
                        this._readBuffer.forEach((tag, index) => __awaiter(this, void 0, void 0, function* () {
                            try {
                                tag.data = yield this.mb_ReadRegisters(tag.params);
                                tag.isError = false;
                                tag.status = 'OK';
                            }
                            catch (error) {
                                tag.isError = true;
                                tag.data = [];
                                if (error instanceof errors_1.InternalError) {
                                    tag.status = error.message;
                                    this._writeBufferConsistent[index].status = tag.status;
                                }
                                else {
                                    tag.status = 'Unknown Error';
                                    this._writeBufferConsistent[index].status = tag.status;
                                }
                            }
                        }));
                        //============ WRITE ASYNC ======================
                        this._writeBuffer.forEach((tag, index) => __awaiter(this, void 0, void 0, function* () {
                            if (tag.execute) {
                                try {
                                    if (!this._readBuffer[index].isError) {
                                        yield this.mb_WriteRegisters(tag.params);
                                        tag.execute = false;
                                        tag.isError = false;
                                        tag.status = 'Done';
                                    }
                                    else {
                                        throw new errors_1.InternalError(this._readBuffer[index].status);
                                    }
                                }
                                catch (error) {
                                    tag.execute = false;
                                    tag.isError = true;
                                    if (error instanceof errors_1.InternalError) {
                                        tag.status = error.message;
                                    }
                                    else
                                        tag.status = 'Unknown Error';
                                }
                            }
                        }));
                        //============ WRITE SYNC ======================
                        this._syncQueue.forEach((query) => {
                            if (!query.isDone && !query.isError) {
                                query.tags.forEach((index, i) => __awaiter(this, void 0, void 0, function* () {
                                    const dataToWrite = Object.assign(Object.assign({}, this._writeBuffer[index - 1].params), { data: query.data[i] });
                                    try {
                                        yield this.mb_WriteRegisters(dataToWrite);
                                        query.status = 'Query Done';
                                        query.isDone = true;
                                    }
                                    catch (error) {
                                        query.isError = true;
                                        if (error instanceof errors_1.InternalError) {
                                            query.status = error.message;
                                        }
                                        else
                                            query.status = 'Unknown Error during writing';
                                    }
                                }));
                            }
                        });
                        //==============================================
                    }
                    else {
                        throw new errors_1.InternalError(`Device offline`);
                    }
                }
                catch (error) {
                    if (!this._connectCmd) {
                        this._socket.connect(this.options);
                        this._connectCmd = true;
                    }
                    this._readBuffer.forEach((tag, index) => {
                        tag.isError = true;
                        if (error instanceof errors_1.InternalError) {
                            tag.status = error.message;
                            this._writeBufferConsistent[index].status = tag.status;
                            tag.data = [];
                        }
                        else {
                            tag.status = 'Unknown Error';
                            this._writeBufferConsistent[index].status = tag.status;
                        }
                    });
                }
                this._readBufferConsistent = structuredClone(this._readBuffer);
                this._writeBuffer = this._writeBuffer.map((tag, index) => {
                    const params = Object.assign(Object.assign({}, tag.params), { data: this._writeBufferConsistent[index].params.data });
                    const toWriteBufer = Object.assign(Object.assign({}, tag), { execute: this._writeBufferConsistent[index].execute ? true : false, params });
                    this._writeBufferConsistent[index].execute = false;
                    return toWriteBufer;
                });
            }), 1000);
        };
        this.mb_ReadRegisters = (params) => __awaiter(this, void 0, void 0, function* () {
            const { start, count, len } = params;
            const startNo = len !== 'Bit' ? start : Math.floor(start / 16);
            const countNo = len !== 'Dword' ? count : count * 2;
            const promise = new Promise((resolve, reject) => {
                this._client
                    .readHoldingRegisters(startNo, countNo)
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
            const { start, data } = params;
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
        this.addToSyncQueue = (data) => {
            this._syncQueue.push(data);
        };
        this.removeFromSyncQueue = (id) => {
            this._syncQueue = this._syncQueue.filter((query) => query.queryId !== id);
        };
        // RTU
        // SerialPort.list().then((ports) => ports.forEach((port) => console.log(port.path)));
        // this._serialOptions = {
        //   path: 'COM1',
        //   baudRate: 9600,
        //   parity: 'none',
        //   dataBits: 8,
        //   stopBits: 1,
        // };
        // this._socketSerial = new SerialPort(this._serialOptions);
        // this._clientRtu = new Modbus.client.RTU(this._socketSerial, 1);
        // this._socketSerial.on('error', console.error);
        // this._socketSerial.on('open', () => {
        //   this._clientRtu.readHoldingRegisters(0, 2);
        // });
        // TCP
        this._socket = new net_1.Socket();
        this._client = new Modbus.client.TCP(this._socket, this.uId);
        this._readBuffer = this.tagsDefs.map((tagDef) => {
            const _a = tagDef.params, { data } = _a, params = __rest(_a, ["data"]);
            return { params, id: tagDef.id, format: tagDef.format, data: [], isError: true, status: 'Init Error' };
        });
        this._writeBuffer = this.tagsDefs.map((tagDef) => {
            const _a = tagDef.params, { count } = _a, params = __rest(_a, ["count"]);
            return { params, id: tagDef.id, format: tagDef.format, execute: false, isError: true, status: 'Write not triggered yet' };
        });
        this._readBufferConsistent = structuredClone(this._readBuffer);
        this._writeBufferConsistent = structuredClone(this._writeBuffer);
        this.loop();
    }
    get readBufferConsistent() {
        return this._readBufferConsistent;
    }
    get writeBufferConsistent() {
        return this._writeBufferConsistent;
    }
    set writeBufferConsistent(data) {
        this._writeBufferConsistent = data;
    }
    get syncQueue() {
        return this._syncQueue;
    }
}
exports.MB_ConnectToDevice = MB_ConnectToDevice;
