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
class S7_ConnectToPlc extends data_plc_1.S7_DataPLC {
    constructor(ip, rack, slot, s7client) {
        super(s7client);
        this.ip = ip;
        this.rack = rack;
        this.slot = slot;
        this.s7client = s7client;
        this.connectPlc = () => __awaiter(this, void 0, void 0, function* () {
            const promise = new Promise((resolve, reject) => {
                this.s7client.Disconnect();
                this.s7client.ConnectTo(this.ip, this.rack, this.slot, (err) => {
                    if (!err) {
                        resolve();
                    }
                    else {
                        reject(`Lost connection to PLC at ${this.ip}, rack: ${this.rack}, slot: ${this.slot}.`);
                    }
                });
            });
            const timeout = new Promise((_, reject) => {
                setTimeout(() => {
                    this.s7client.Disconnect();
                    reject(`Lost connection to PLC at ${this.ip}, rack: ${this.rack}, slot: ${this.slot}.`);
                }, conn_params_1.s7_triggetTime / 8);
            });
            return Promise.race([promise, timeout]);
        });
        this._id = ++S7_ConnectToPlc.countId;
        this._readBuffer = [];
        this._writeBuffer = [];
    }
    get id() {
        return this._id;
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
}
exports.S7_ConnectToPlc = S7_ConnectToPlc;
S7_ConnectToPlc.countId = 0;
