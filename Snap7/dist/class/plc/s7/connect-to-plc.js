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
exports.S7_ConnectToPlc = void 0;
const data_plc_1 = require("./data-plc");
const errors_1 = require("../../../types/server/errors");
const fixed_1 = require("set-interval-async/fixed");
class S7_ConnectToPlc extends data_plc_1.S7_DataPLC {
    constructor(ip, rack, slot, readData, writeData) {
        super();
        this.ip = ip;
        this.rack = rack;
        this.slot = slot;
        this.readData = readData;
        this.writeData = writeData;
        this._readBufferConsistent = [];
        this._syncQueue = [];
        this.s7_connectPlc = () => __awaiter(this, void 0, void 0, function* () {
            const promise = new Promise((resolve, reject) => {
                this.s7client.Disconnect();
                this.s7client.ConnectTo(this.ip, this.rack, this.slot, (err) => {
                    if (!err) {
                        resolve();
                    }
                    else {
                        reject(new errors_1.InternalError(`Lost connection to PLC at ${this.ip}, rack: ${this.rack}, slot: ${this.slot}.`));
                    }
                });
            });
            const timeout = new Promise((_, reject) => {
                setTimeout(() => {
                    this.s7client.Disconnect();
                    reject(new errors_1.InternalError(`Lost connection to PLC at ${this.ip}, rack: ${this.rack}, slot: ${this.slot}.`));
                }, 2000);
            });
            return Promise.race([promise, timeout]);
        });
        this.loop = () => {
            (0, fixed_1.setIntervalAsync)(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.s7_connectPlc();
                    //============================ READ ASYNC ===================
                    for (const [index, tag] of this._readBuffer.entries()) {
                        try {
                            const data = yield this.s7_readFromPlc([tag.params]);
                            tag.data = data[0].Data;
                            tag.isError = false;
                            tag.status = 'OK';
                        }
                        catch (error) {
                            tag.data = Buffer.from([]);
                            tag.isError = true;
                            if (error instanceof errors_1.InternalError) {
                                tag.status = error.message;
                                this._writeBufferConsistent[index].status = tag.status;
                            }
                            else {
                                tag.status = 'Unknown Error';
                                this._writeBufferConsistent[index].status = tag.status;
                            }
                        }
                    }
                }
                catch (error) {
                    this._readBuffer.forEach((tag, index) => {
                        tag.isError = true;
                        tag.data = Buffer.from([]);
                        if (error instanceof errors_1.InternalError) {
                            tag.status = error.message;
                            this._writeBufferConsistent[index].status = tag.status;
                        }
                        else {
                            tag.status = 'Unknown error';
                            this._writeBufferConsistent[index].status = tag.status;
                        }
                    });
                }
                this._readBufferConsistent = structuredClone(this._readBuffer);
                //============================ WRITE ASYNC ===================
                for (const [index, tag] of this._writeBuffer.entries()) {
                    if (tag.execute) {
                        try {
                            if (!this._readBuffer[index].isError) {
                                yield this.s7_writeToPlc([tag.params]);
                                tag.execute = false;
                                tag.isError = false;
                                tag.status = 'Async Write Done';
                                this._writeBufferConsistent[index].status = tag.status;
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
                                this._writeBufferConsistent[index].status = tag.status;
                            }
                            else {
                                tag.status = 'Unknown error';
                                this._writeBufferConsistent[index].status = tag.status;
                            }
                        }
                    }
                }
                this._writeBuffer = this._writeBuffer.map((data, index) => {
                    const params = Object.assign(Object.assign({}, data.params), { Data: this._writeBufferConsistent[index].params.Data });
                    const toWriteBufer = Object.assign(Object.assign({}, data), { execute: this._writeBufferConsistent[index].execute ? true : false, params });
                    this._writeBufferConsistent[index].execute = false;
                    return toWriteBufer;
                });
                //============================ WRITE SYNC ===================
                for (const query of this._syncQueue) {
                    if (!query.isDone && !query.isError) {
                        const dataToWrite = query.tags.map((index, i) => {
                            return Object.assign(Object.assign({}, this._writeBufferSync[index - 1].params), { Data: query.data[i] });
                        });
                        try {
                            yield this.s7_writeToPlc(dataToWrite);
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
                    }
                }
            }), 300);
        };
        this.addToSyncQueue = (data) => {
            this._syncQueue.push(data);
        };
        this.removeFromSyncQueue = (id) => {
            this._syncQueue = this._syncQueue.filter((query) => query.queryId !== id);
        };
        this._readBuffer = readData.map((def) => {
            return { params: def.params, format: def.format, data: Buffer.from([]), isError: true, status: 'Init Error', id: def.id };
        });
        this._writeBuffer = writeData.map((def) => {
            return { params: def.params, format: def.format, execute: false, isError: false, status: 'No write command triggered yet', id: def.id };
        });
        this._readBufferConsistent = structuredClone(this._readBuffer);
        this._writeBufferConsistent = structuredClone(this._writeBuffer);
        this._writeBufferSync = structuredClone(this._writeBuffer);
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
exports.S7_ConnectToPlc = S7_ConnectToPlc;
