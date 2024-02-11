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
const conn_params_1 = require("../../../connections/plc/s7/conn-params");
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
        this._isSyncBusy = false;
        this.s7_connectPlc = () => __awaiter(this, void 0, void 0, function* () {
            const promise = new Promise((resolve, reject) => {
                this.s7client.Disconnect();
                this.s7client.ConnectTo(this.ip, this.rack, this.slot, (err) => {
                    if (!err) {
                        resolve();
                    }
                    else {
                        reject(new errors_1.CustomError(`Lost connection to PLC at ${this.ip}, rack: ${this.rack}, slot: ${this.slot}.`));
                    }
                });
            });
            const timeout = new Promise((_, reject) => {
                setTimeout(() => {
                    this.s7client.Disconnect();
                    reject(new errors_1.CustomError(`Lost connection to PLC at ${this.ip}, rack: ${this.rack}, slot: ${this.slot}.`));
                }, conn_params_1.s7_triggetTime / 1.5);
            });
            return Promise.race([promise, timeout]);
        });
        this.loop = () => {
            const readParams = this._readBuffer.map((param) => {
                return param.params;
            });
            (0, fixed_1.setIntervalAsync)(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.s7_connectPlc();
                    readParams.forEach((param, index) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            const data = yield this.s7_readFromPlc([param]);
                            this._readBuffer[index].data = data[0].Data;
                            this._readBuffer[index].isError = false;
                            this._readBuffer[index].status = 'OK';
                        }
                        catch (error) {
                            this._readBuffer[index].data = Buffer.from([0]);
                            this._readBuffer[index].isError = true;
                            if (error instanceof errors_1.CustomError) {
                                this._readBuffer[index].status = error.message;
                                this._writeBuffer[index].status = this._readBuffer[index].status;
                            }
                            else {
                                this._readBuffer[index].status = 'Unknown error';
                                this._writeBuffer[index].status = this._readBuffer[index].status;
                            }
                        }
                    }));
                }
                catch (error) {
                    this._readBuffer.forEach((data, index) => {
                        data.isError = true;
                        data.data = Buffer.from([0]);
                        if (error instanceof errors_1.CustomError) {
                            data.status = error.message;
                            this._writeBuffer[index].status = data.status;
                        }
                        else {
                            data.status = 'Unknown error';
                            this._writeBuffer[index].status = data.status;
                        }
                    });
                }
                try {
                    const writeData = this._writeBuffer
                        .map((data, index) => {
                        return { data: data.params, index, execute: data.execute };
                    })
                        .filter((data) => data.execute);
                    writeData.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                        if (!this._readBuffer[data.index].isError) {
                            yield this.s7_writeToPlc([data.data]);
                            this._writeBuffer[data.index].execute = false;
                            this._writeBuffer[data.index].isError = false;
                            this._writeBuffer[data.index].status = 'Done';
                        }
                        else {
                            this._writeBuffer[data.index].execute = false;
                            this._writeBuffer[data.index].isError = true;
                        }
                    }));
                }
                catch (error) {
                    this._writeBuffer.forEach((data) => {
                        data.isError = true;
                        data.execute = false;
                        if (error instanceof errors_1.CustomError)
                            data.status = error.message;
                        else
                            data.status = 'Unknown error';
                    });
                }
                finally {
                    this._isSyncBusy = false;
                }
            }), conn_params_1.s7_triggetTime);
        };
        this._readBuffer = readData.map((def) => {
            return { params: def.params, format: def.format, data: Buffer.from([0]), isError: true, status: 'Init Error' };
        });
        this._writeBuffer = writeData.map((def) => {
            return { params: def.params, format: def.format, execute: false, isError: false, status: 'No write command triggered yet' };
        });
        this.loop();
    }
    get readBuffer() {
        return this._readBuffer;
    }
    set readBuffer(data) {
        this._readBuffer = data;
    }
    get writeBuffer() {
        return this._writeBuffer;
    }
    set writeBuffer(data) {
        this._writeBuffer = data;
    }
    set isSyncBusy(data) {
        this._isSyncBusy = data;
    }
    get isSyncBusy() {
        return this._isSyncBusy;
    }
}
exports.S7_ConnectToPlc = S7_ConnectToPlc;
