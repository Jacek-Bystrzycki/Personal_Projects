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
exports.RTU_ConnectToDevice = void 0;
const serialport_1 = require("serialport");
const Modbus = require("jsmodbus");
const errors_1 = require("../../../types/server/errors");
const dynamic_1 = require("set-interval-async/dynamic");
const sleep_1 = require("../../../utils/sleep");
class RTU_ConnectToDevice {
    constructor(portName, uId, tagsDefs) {
        this.portName = portName;
        this.uId = uId;
        this.tagsDefs = tagsDefs;
        this._client = [];
        this._isOpened = false;
        this._readBuffer = [];
        this._writeBuffer = [];
        this._deviceOK = [];
        this._writeBufferConsistent = [];
        this._syncQueue = [];
        this.loop = () => {
            this._socket.on('error', () => {
                this._isOpened = false;
            });
            this._socket.on('close', () => {
                this._isOpened = false;
            });
            this._socket.on('open', () => {
                this._isOpened = true;
            });
            // SerialPort.list().then((ports) => ports.forEach((port) => console.log(port.path)));
            (0, dynamic_1.setIntervalAsync)(() => __awaiter(this, void 0, void 0, function* () {
                if (this._isOpened) {
                    //============ READ ASYNC ======================
                    for (let i = 0; i < this._readBuffer.length; i++) {
                        for (let j = 0; j < this._readBuffer[i].tags.length; j++) {
                            if (j === 0)
                                this._deviceOK[i] = true;
                            if (this._deviceOK[i]) {
                                try {
                                    this._readBuffer[i].tags[j].data = yield this.rtu_ReadRegisters(this._client[i], this._readBuffer[i].tags[j].params);
                                    this._readBuffer[i].tags[j].isError = false;
                                    this._readBuffer[i].tags[j].status = 'OK';
                                }
                                catch (error) {
                                    this._deviceOK[i] = false;
                                    for (let y = j; y < this._readBuffer[i].tags.length; y++) {
                                        this._readBuffer[i].tags[y].isError = true;
                                        this._readBuffer[i].tags[y].data = [];
                                    }
                                    if (error instanceof errors_1.InternalError) {
                                        for (let y = j; y < this._readBuffer[i].tags.length; y++) {
                                            this._readBuffer[i].tags[y].status = error.message;
                                            this._writeBufferConsistent[i].tags[y].status = error.message;
                                        }
                                    }
                                    else {
                                        for (let y = j; y < this._readBuffer[i].tags.length; y++) {
                                            this._readBuffer[i].tags[y].status = 'Unknown Error';
                                            this._writeBufferConsistent[i].tags[y].status = 'Unknown Error';
                                        }
                                    }
                                }
                                finally {
                                    yield (0, sleep_1.sleep)(80);
                                }
                            }
                        }
                    }
                    //============ WRITE ASYNC ======================
                    for (let i = 0; i < this._writeBuffer.length; i++) {
                        for (let j = 0; j < this._writeBuffer[i].tags.length; j++) {
                            if (this._writeBuffer[i].tags[j].execute) {
                                try {
                                    if (!this._readBuffer[i].tags[j].isError) {
                                        yield this.rtu_WriteRegisters(this._client[i], this._writeBuffer[i].tags[j].params);
                                        this._writeBuffer[i].tags[j].execute = false;
                                        this._writeBuffer[i].tags[j].isError = false;
                                        this._writeBuffer[i].tags[j].status = 'Done';
                                    }
                                    else {
                                        throw new errors_1.InternalError(this._readBuffer[i].tags[j].status);
                                    }
                                }
                                catch (error) {
                                    this._writeBuffer[i].tags[j].execute = false;
                                    this._writeBuffer[i].tags[j].isError = true;
                                    if (error instanceof errors_1.InternalError) {
                                        this._writeBuffer[i].tags[j].status = error.message;
                                    }
                                    else
                                        this._writeBuffer[i].tags[j].status = 'Unknown Error';
                                }
                                finally {
                                    yield (0, sleep_1.sleep)(80);
                                }
                            }
                        }
                    }
                    //============ WRITE SYNC ======================
                    for (const query of this._syncQueue) {
                        if (!query.isDone && !query.isError) {
                            for (const [i, index] of query.tags.entries()) {
                                const dataToWrite = Object.assign(Object.assign({}, this._writeBuffer.find((instance) => instance.uId === query.uId).tags[index - 1].params), { data: query.data[i] });
                                try {
                                    const clientIndex = this._writeBuffer.findIndex((instance) => instance.uId === query.uId);
                                    yield this.rtu_WriteRegisters(this._client[clientIndex], dataToWrite);
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
                                finally {
                                    yield (0, sleep_1.sleep)(80);
                                }
                            }
                        }
                    }
                    //===============
                }
                else {
                    for (let i = 0; i < this._readBuffer.length; i++) {
                        for (let j = 0; j < this._readBuffer[i].tags.length; j++) {
                            this._readBuffer[i].tags[j].isError = true;
                            this._readBuffer[i].tags[j].status = 'Port is closed';
                            this._readBuffer[i].tags[j].data = [];
                        }
                    }
                }
                //===========
                this._writeBuffer = this._writeBuffer.map((device, index) => {
                    return {
                        uId: device.uId,
                        tags: device.tags.map((tag, tagIndex) => {
                            const params = Object.assign(Object.assign({}, tag.params), { data: this.writeBufferConsistent[index].tags[tagIndex].params.data });
                            const toWriteBufer = Object.assign(Object.assign({}, tag), { params, execute: this.writeBufferConsistent[index].tags[tagIndex].execute ? true : false });
                            this._writeBufferConsistent[index].tags[tagIndex].execute = false;
                            return toWriteBufer;
                        }),
                    };
                });
            }), 1);
        };
        this.rtu_ReadRegisters = (client, params) => __awaiter(this, void 0, void 0, function* () {
            const { start, count, len } = params;
            const startNo = len !== 'Bit' ? start : Math.floor(start / 16);
            const countNo = len !== 'Dword' ? count : count * 2;
            return new Promise((resolve, reject) => {
                client
                    .readHoldingRegisters(startNo, countNo)
                    .then(({ response }) => {
                    resolve(response.body.valuesAsArray);
                })
                    .catch((err) => {
                    const error = this.rtu_handleErrors(err);
                    reject(new errors_1.InternalError(`${error}`));
                });
            });
        });
        this.rtu_WriteRegisters = (client, params) => __awaiter(this, void 0, void 0, function* () {
            const { start, data, len } = params;
            const startNo = len === 'Bit' ? Math.floor(start / 16) : start;
            return new Promise((resolve, reject) => {
                client
                    .writeMultipleRegisters(startNo, data)
                    .then(() => {
                    resolve();
                })
                    .catch((err) => {
                    const error = this.rtu_handleErrors(err);
                    reject(new errors_1.InternalError(`${error}`));
                });
            });
        });
        this.rtu_handleErrors = (err) => {
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
        if (uId.length !== tagsDefs.length)
            throw new Error('Wrong RTU params');
        this._options = {
            path: this.portName ? this.portName : 'COM1',
            baudRate: 9600,
            parity: 'none',
            dataBits: 8,
            stopBits: 1,
            rtscts: false,
            xon: false,
            xoff: false,
            xany: false,
            hupcl: true,
        };
        this._socket = new serialport_1.SerialPort(this._options);
        this.tagsDefs.forEach((device, index) => {
            this._client[index] = new Modbus.client.RTU(this._socket, this.uId[index]);
            const uId = this.uId[index];
            const tags = device.map((tagDef) => {
                const _a = tagDef.params, { data } = _a, params = __rest(_a, ["data"]);
                return { params, id: tagDef.id, format: tagDef.format, data: [], isError: true, status: 'Init Error' };
            });
            const tempDevice = { uId, tags };
            this._readBuffer.push(tempDevice);
            const writeTag = device.map((tagDef) => {
                const _a = tagDef.params, { count } = _a, params = __rest(_a, ["count"]);
                return { params, id: tagDef.id, format: tagDef.format, execute: false, isError: true, status: 'Write not triggered yet' };
            });
            const tempDeviceWrite = { uId, tags: writeTag };
            this._writeBuffer.push(tempDeviceWrite);
        });
        this._writeBufferConsistent = structuredClone(this._writeBuffer);
        this.uId.forEach((_, index) => {
            this._deviceOK[index] = true;
        });
        this.loop();
    }
    get readBuffer() {
        return this._readBuffer;
    }
    get writeBufferConsistent() {
        return this._writeBufferConsistent;
    }
    set writeBufferConsistent(data) {
        this.writeBufferConsistent = data;
    }
    get syncQueue() {
        return this._syncQueue;
    }
}
exports.RTU_ConnectToDevice = RTU_ConnectToDevice;
